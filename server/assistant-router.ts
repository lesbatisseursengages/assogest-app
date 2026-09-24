import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { protectedProcedure, router } from "./_core/trpc";

const assistantMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const ASSISTANT_SYSTEM_PROMPT = `Tu es l’assistant d’aide intégré à l’application « Les Bâtisseurs Engagés », une plateforme de gestion administrative et financière d’une association basée au Tchad.

Ta mission est d’expliquer simplement comment utiliser l’application, en français, avec des étapes courtes et concrètes. Tu peux guider l’utilisateur sur :
- le tableau de bord, les indicateurs et les activités récentes ;
- les contacts CRM, les membres, les adhésions et les rôles ;
- les dons, cotisations, dépenses, reçus et finances ;
- les documents, catégories, archives et fichiers ;
- les projets, responsables, coordonnées GPS et météo locale Open-Meteo ;
- les activités CRM, annonces, emails, notifications et paramètres.

Règles importantes :
- Ne prétends jamais avoir effectué une action dans la base de données. Explique plutôt où cliquer et quelles informations saisir.
- Ne demande jamais de mot de passe, clé API, token, donnée bancaire ou secret.
- Si la question concerne une fonctionnalité absente ou une erreur technique, indique-le clairement et propose de contacter l’administrateur.
- Ne donne pas de conseil juridique, fiscal ou financier professionnel ; indique que les règles locales doivent être vérifiées auprès d’un professionnel.
- Réponds en 3 à 8 phrases maximum, avec une liste numérotée lorsque des étapes sont nécessaires.`;

export const assistantRouter = router({
  ask: protectedProcedure
    .input(z.object({ messages: z.array(assistantMessageSchema).min(1).max(20) }))
    .mutation(async ({ input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
            ...input.messages.slice(-12),
          ],
        });
        const content = response.choices[0]?.message?.content;
        if (typeof content === "string" && content.trim()) return content.trim();
        if (Array.isArray(content)) {
          const text = content
            .filter((part): part is { type: "text"; text: string } => part.type === "text")
            .map((part) => part.text)
            .join("\n")
            .trim();
          if (text) return text;
        }
        throw new Error("Réponse IA vide");
      } catch (error) {
        console.error("[Assistant IA] LLM request failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "L’assistant est momentanément indisponible. Réessayez dans quelques instants.",
          cause: error,
        });
      }
    }),
});
