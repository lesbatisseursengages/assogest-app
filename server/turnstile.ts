import { TRPCError } from "@trpc/server";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: string | undefined, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "La protection Cloudflare Turnstile n'est pas configurée.",
    });
  }

  if (!token) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Veuillez valider la protection anti-robot avant de continuer.",
    });
  }

  const form = new URLSearchParams({ secret, response: token });
  if (remoteIp) form.set("remoteip", remoteIp);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const result = (await response.json()) as { success?: boolean };
    if (!response.ok || !result.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "La validation Cloudflare a échoué. Veuillez réessayer.",
      });
    }
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "La validation Cloudflare est momentanément indisponible.",
      cause: error,
    });
  }
}
