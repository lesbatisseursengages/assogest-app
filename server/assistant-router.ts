import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { protectedProcedure, router } from "./_core/trpc";
import { getAllMembers, getDons, getDepenses, getGlobalDashboardSummary, listCrmContacts, listProjects } from "./db";

const assistantMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const assistantInputSchema = z.object({
  messages: z.array(assistantMessageSchema).min(1).max(20),
  pagePath: z.string().trim().max(200).optional(),
});

const assistantActionSchema = z.object({
  label: z.string().min(1).max(80),
  path: z.string().min(1).max(120),
  description: z.string().max(160).optional(),
});

const assistantResponseSchema = {
  type: "object",
  properties: {
    answer: { type: "string", description: "Réponse précise en français, avec les chiffres réels fournis dans le contexte." },
    actions: { type: "array", items: { type: "object", properties: { label: { type: "string" }, path: { type: "string" }, description: { type: "string" } }, required: ["label", "path"], additionalProperties: false } },
  },
  required: ["answer", "actions"],
  additionalProperties: false,
} as const;

const ALLOWED_ACTION_PATHS = new Set([
  "/", "/dashboard", "/members", "/members/adhesions", "/adhesions-list", "/member-directory", "/volunteers", "/finance", "/pricing",
  "/documents", "/categories", "/archives", "/projects", "/events", "/campaigns", "/crm", "/crm/contacts", "/crm/activities", "/crm/reports",
  "/antennes", "/groupes-antennes", "/governance/dashboard", "/announcements", "/news", "/email-composer", "/email-templates", "/email-history",
  "/notifications", "/activity", "/audit-history", "/settings", "/global-settings", "/users", "/admin/roles", "/admin/permissions", "/admin/audit-logs", "/admin/password-resets",
]);

function compact(value: unknown, limit = 24000) {
  const text = JSON.stringify(value, (_key, item) => item instanceof Date ? item.toISOString() : item);
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

async function loadLiveApplicationContext() {
  const [summary, members, contacts, projects, dons, depenses] = await Promise.all([
    getGlobalDashboardSummary(), getAllMembers(), listCrmContacts(), listProjects(50, 0), getDons(), getDepenses(),
  ]);
  return {
    generatedAt: summary.generatedAt,
    dashboard: summary,
    members: members.slice(0, 100).map(({ id, firstName, lastName, email, phone, role, function: memberFunction, status, memberId, membershipCategory }) => ({ id, firstName, lastName, email, phone, role, function: memberFunction, status, memberId, membershipCategory })),
    contacts: contacts.slice(0, 100).map(({ id, firstName, lastName, email, phone, company, position, city, segment, status }) => ({ id, firstName, lastName, email, phone, company, position, city, segment, status })),
    projects: projects.slice(0, 50).map((project: any) => ({ id: project.id, name: project.name, status: project.status, startDate: project.startDate, endDate: project.endDate, budget: project.budget, locationLabel: project.locationLabel, leaderId: project.leaderId })),
    donations: dons.slice(0, 100).map(({ id, donateur, montant, currency, date, description, email }) => ({ id, donateur, montant, currency, date, description, email })),
    expenses: depenses.slice(0, 100).map(({ id, description, montant, currency, categorie, date, notes }) => ({ id, description, montant, currency, categorie, date, notes })),
  };
}

/**
 * Source de vérité fonctionnelle de l’assistant. Elle décrit uniquement les
 * écrans et parcours présents dans le dépôt afin d’éviter les réponses inventées.
 */
const APPLICATION_MANUAL = `
APPLICATION : « Les Bâtisseurs Engagés — Gestion associative », association basée au Tchad.

RÈGLE DE NAVIGATION : chaque réponse doit donner le module, le chemin exact entre crochets et les étapes à suivre. Exemple : « Membres — [Membres](/members) > Ajouter un membre ». Ne donne jamais un nom de bouton ou un chemin qui ne figure pas dans ce manuel.

1) ACCUEIL ET TABLEAUX DE BORD
- [Accueil](/) : choix du mode en ligne/hors ligne et statistiques d’accueil.
- [Tableau de bord](/dashboard) : statistiques globales, membres actifs, finance, projets, tâches, campagnes, adhésions, paiements récents, tâches urgentes, projets actifs, activité CRM récente et onboarding.
- Les cartes d’accueil sont interactives : dons → [Finance](/finance), membres → [Membres](/members), projets → [Projets](/projects), activité → [CRM](/crm).
- Le total des dons est calculé depuis les dons enregistrés et présenté selon la devise d’affichage ; les montants d’origine restent dans Finance.

2) MEMBRES, ADHÉSIONS ET BÉNÉVOLES
- [Membres](/members) : liste, recherche, ajout, visualisation/modification, suppression, évaluation/progression et import CSV des membres.
- Pour ajouter : ouvrir « Ajouter un membre », saisir identité, email/téléphone, rôle/fonction, statut et catégorie d’adhésion, puis enregistrer.
- L’import intégré des membres accepte un CSV avec en-têtes comme firstName, lastName, email, phone, status, memberID, membershipCategory. Il faut d’abord sélectionner le fichier, utiliser l’aperçu, corriger les erreurs, puis importer. Les identifiants et emails déjà utilisés sont ignorés.
- [Adhésions](/members/adhesions) : créer une adhésion pour un membre avec période, montant et mode de paiement.
- [Liste des adhérents](/adhesions-list) : consulter les adhésions.
- [Annuaire interne](/member-directory) : consulter l’annuaire des membres.
- [Portail bénévoles](/volunteers) : gérer les disponibilités et engagements bénévoles.
- [Mon profil adhérent](/member-portal) : espace du membre connecté.
- Les rôles et permissions administratives sont dans [Gestion des rôles](/admin/roles) et [Permissions & Périmètres](/admin/permissions). Les écrans CRM et les imports généraux sont réservés à un administrateur.

3) FINANCES
- [Finance](/finance) contient les onglets/sections cotisations, dons et dépenses.
- Cotisation : « Ajouter une cotisation », sélectionner le membre, la catégorie, le montant, la devise, la période et le statut de paiement.
- Don : « Enregistrer un don », saisir donateur, montant, devise, date, email/téléphone éventuels et description.
- Dépense : « Ajouter une dépense », saisir description, montant, devise, catégorie, date, approbation et justificatif éventuel.
- Reçus : la zone de génération de document permet de choisir « Reçu fiscal de don » ou « Certificat de don », puis le donateur, le montant et la date.
- Les devises prises en charge sont EUR et XOF/F CFA, avec conversion selon le taux configuré. L’assistant ne donne pas d’avis fiscal ou financier professionnel.
- [Tarification & paiements](/pricing) concerne la configuration de tarification/paiements, pas la saisie quotidienne des dons.

4) DOCUMENTS
- [Documents](/documents) : créer, classer, rechercher, modifier, archiver et consulter les documents.
- Les catégories se gèrent dans [Catégories](/categories) ; les documents archivés dans [Archives](/archives).
- Les états utilisés sont notamment en attente, en cours et complété ; la priorité peut être basse, moyenne, haute ou urgente.
- Les fichiers PDF et images peuvent être prévisualisés lorsqu’un fichier est attaché et que son type est reconnu. Sinon, utiliser le bouton d’ouverture/téléchargement du fichier.
- Les documents urgents et leurs échéances apparaissent dans le tableau de bord.

5) CRM
- [Tableau de bord CRM](/crm) : synthèse des contacts et activités.
- [Contacts](/crm/contacts) : ajouter, rechercher, modifier et supprimer un contact. Un contact comprend identité, email, téléphone, entreprise, fonction, ville/pays, segment, statut, tags et notes.
- [Activités](/crm/activities) : ajouter, modifier et supprimer une activité liée à un contact. Types courants : appel, email, réunion ou tâche ; renseigner le contact, le titre, le type, la date, le statut, la priorité et la description.
- [Rapports CRM](/crm/reports) : rapports d’engagement, pipeline, activité ou segments.
- Le groupe CRM est visible aux administrateurs. Pour une personne non administratrice, expliquer que l’accès doit être accordé par l’administrateur.

6) PROJETS ET ACTIVITÉS DE TERRAIN
- [Projets](/projects) : créer, modifier et consulter les projets ; la page contient le diagramme de Gantt global.
- Un projet possède nom, description, statut (planification, en cours, suspendu, terminé ou archivé), dates, budget, responsable et localisation.
- La localisation accepte un libellé et des coordonnées latitude/longitude ; le sélecteur Google Maps permet de choisir le point sur la carte.
- Le Gantt permet d’ajouter des tâches spécifiques avec titre, description, statut, priorité, responsable et dates. Les barres projet/tâche sont déplaçables pour modifier la période ; la sauvegarde est faite côté serveur.
- [Détail d’un projet](/projects/:id) : météo locale Open-Meteo, résumé, tâches, tâches en retard, jalons, budget, membres du projet, mises à jour et commentaires de tâches.
- Pour obtenir une météo locale fiable : ouvrir le projet, renseigner la zone et les coordonnées GPS, enregistrer, puis consulter sa fiche détaillée. Sans coordonnées, l’application utilise la localisation par défaut de N’Djamena.
- [Événements](/events) : organiser les activités et événements associatifs.
- [Campagnes](/campaigns) : créer et suivre des objectifs de collecte.

7) COMMUNICATION ET SUIVI
- [Annonces](/announcements) : annonces internes/associatives.
- [Actualités](/news) : publier et gérer les actualités.
- [Composer un email](/email-composer), [Templates email](/email-templates), [Historique emails](/email-history) : communication email et suivi d’envoi.
- [Notifications](/notifications) : consulter les alertes de l’application.
- [Activité](/activity) et [Historique d’audit](/audit-history) : suivre les actions et événements du système.

8) GROUPES, ANTENNES, GOUVERNANCE ET ADMINISTRATION
- [Antennes](/antennes) et [Groupes & Antennes (Legacy)](/groupes-antennes) : gérer les implantations/groupes.
- [Gouvernance & AG](/governance/dashboard) : assemblées, participants, résolutions, votes et gouvernance.
- [Identité de l’association](/global-settings) : nom, siège, email et informations institutionnelles.
- [Utilisateurs](/users) : gérer les comptes utilisateurs si administrateur.
- [Journaux d’audit](/admin/audit-logs) et [Réinitialisations MDP](/admin/password-resets) : administration et sécurité.
- [Paramètres](/settings) : préférences générales et interface.

9) DONNÉES DE DÉMONSTRATION ET IMPORT RÉEL
- Le bouton « Générer des données de démonstration » crée un jeu cohérent tchadien lié entre contacts, membres, dons, dépenses, projets, tâches, documents et activités.
- Le bouton « Réinitialiser les données » concerne le mode de démonstration et supprime les enregistrements marqués démo ; il ne doit pas être présenté comme une suppression générale de la base.
- Depuis l’accueil, un administrateur peut utiliser « Importer un CSV » pour contacts CRM, membres, dons ou projets. Le fichier est vérifié côté serveur, limité à 2 Mo/1 000 lignes et prévisualisé avant écriture.
- Pour remplacer les données démo lors de cet import, cocher l’option et saisir exactement REMPLACER. Cette action ne doit être recommandée qu’après sauvegarde/export des données utiles.

LIMITES ET COMPORTEMENT HONNÊTE :
- Tu guides l’utilisateur ; tu ne prétends jamais avoir cliqué, créé, modifié, supprimé ou vérifié une donnée réelle.
- Tu ne demandes jamais de mot de passe, clé API, token, secret ou donnée bancaire.
- Si la question porte sur une fonction absente de ce manuel, dis « Je ne peux pas confirmer que cette fonction existe dans la version actuelle » et propose le module le plus proche, sans inventer de bouton.
- Si l’utilisateur demande une valeur réelle (total actuel, nom d’un membre, état d’un document), précise que tu n’as pas accès à la ligne de données dans cette conversation et indique l’écran où la vérifier.
- Réponds en français, de façon directe, avec 3 à 8 phrases ou une liste numérotée. Termine si possible par une question de clarification ciblée.
`;

export const assistantRouter = router({
  ask: protectedProcedure
    .input(assistantInputSchema)
    .mutation(async ({ input, ctx }) => {
      const roleContext = ctx.user.role === "admin"
        ? "L’utilisateur connecté est administrateur : il peut accéder aux écrans réservés et aux imports."
        : "L’utilisateur connecté n’est pas administrateur : ne lui promets pas l’accès aux écrans CRM, rôles, permissions ou imports administratifs.";
      const pageContext = input.pagePath ? `Écran actuellement ouvert : ${input.pagePath}. Oriente prioritairement vers cet écran ou explique le chemin depuis celui-ci.` : "Écran actuel inconnu.";
      try {
        const liveContext = await loadLiveApplicationContext();
        const response = await invokeLLM({
          messages: [
            { role: "system", content: `${APPLICATION_MANUAL}\nCONTEXTE DE SESSION :\n- ${roleContext}\n- ${pageContext}\n\nDONNÉES RÉELLES LUES À L’INSTANT (source de vérité, ne les invente pas) :\n${compact(liveContext)}\n\nFORMAT OBLIGATOIRE : retourne uniquement un objet JSON avec "answer" et "actions". Dans answer, réponds à la question en utilisant les données réelles si elles sont pertinentes. Dans actions, propose au maximum 3 boutons vers les chemins autorisés, uniquement si utiles. Ne mets jamais de lien Markdown dans answer. Si aucune action n’est utile, retourne actions: [].` },
            ...input.messages.slice(-12),
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "assistant_navigation_response", strict: true, schema: assistantResponseSchema },
          },
        });
        const content = response.choices[0]?.message?.content;
        const rawText = typeof content === "string" ? content.trim() : Array.isArray(content)
          ? content.filter((part): part is { type: "text"; text: string } => part.type === "text").map((part) => part.text).join("\n").trim()
          : "";
        if (rawText) {
          const parsed = JSON.parse(rawText) as { answer?: string; actions?: unknown[] };
          const actions = z.array(assistantActionSchema).safeParse(parsed.actions ?? []);
          const adminOnlyPaths = new Set(["/crm", "/crm/contacts", "/crm/activities", "/crm/reports", "/users", "/admin/roles", "/admin/permissions", "/admin/audit-logs", "/admin/password-resets", "/global-settings"]);
          return {
            answer: parsed.answer?.trim() || "Je n’ai pas pu formuler une réponse exploitable.",
            actions: actions.success ? actions.data.filter((action) => ALLOWED_ACTION_PATHS.has(action.path) && (ctx.user.role === "admin" || !adminOnlyPaths.has(action.path))).slice(0, 3) : [],
            liveData: {
              generatedAt: liveContext.generatedAt,
              dashboard: {
                membersActive: liveContext.dashboard.members.active,
                membersTotal: liveContext.dashboard.members.total,
                totalDons: liveContext.dashboard.finance.totalDons,
                totalDepenses: liveContext.dashboard.finance.totalDepenses,
                balance: liveContext.dashboard.finance.balance,
                projectsTotal: liveContext.dashboard.projects.total,
                projectsCompleted: liveContext.dashboard.projects.completed,
                projectsInProgress: liveContext.dashboard.projects.inProgress,
                documentsUrgent: liveContext.dashboard.activity.urgentTasks?.length ?? 0,
              },
            },
          };
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
