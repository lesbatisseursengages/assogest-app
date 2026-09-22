const BREVO_API_KEY_ENV = "APP_BREVO_API_KEY";

/** Resolve the Brevo API key only on the server. */
export function getBrevoApiKey() {
  return process.env[BREVO_API_KEY_ENV] || process.env.BREVO_API_KEY || "";
}

export const brevoApiKeyEnvName = BREVO_API_KEY_ENV;
