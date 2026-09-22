import { getBrevoApiKey } from "./brevo-config";

const BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

type BrevoEmailAddress = {
  email: string;
  name?: string;
};

export type BrevoEmailInput = {
  sender: BrevoEmailAddress;
  to: BrevoEmailAddress[];
  subject: string;
  textContent: string;
  tags?: string[];
  headers?: Record<string, string>;
};

export async function sendBrevoEmail(input: BrevoEmailInput, fetchImpl: typeof fetch = fetch) {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    throw new Error("Brevo n’est pas configuré. Ajoutez APP_BREVO_API_KEY dans les secrets WebDev.");
  }

  const response = await fetchImpl(BREVO_EMAIL_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const responseText = await response.text();
  let responseBody: { messageId?: string; message?: string } = {};
  try {
    responseBody = JSON.parse(responseText) as typeof responseBody;
  } catch {
    // Brevo may return an empty or non-JSON body for some upstream errors.
  }

  if (!response.ok) {
    const reason = typeof responseBody.message === "string" ? ` ${responseBody.message}` : "";
    throw new Error(`Brevo a refusé l’envoi (HTTP ${response.status}).${reason}`);
  }

  return { messageId: responseBody.messageId ?? null };
}
