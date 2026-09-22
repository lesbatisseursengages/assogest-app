import { describe, expect, it, vi } from "vitest";
import { getBrevoApiKey } from "./brevo-config";
import { sendBrevoEmail } from "./brevo";

describe("Brevo integration contract", () => {
  it("authenticates the configured API key against Brevo account endpoint", async () => {
    const apiKey = getBrevoApiKey();
    expect(apiKey, "La clé Brevo doit être configurée dans les secrets WebDev.").toMatch(/^xkeysib-/);
    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: { accept: "application/json", "api-key": apiKey },
      signal: AbortSignal.timeout(15_000),
    });
    expect(response.ok, `Brevo a refusé la clé avec HTTP ${response.status}.`).toBe(true);
  }, 20_000);

  it("builds a server-side transactional request without exposing the key to the client", async () => {
    const previousKey = process.env.APP_BREVO_API_KEY;
    process.env.APP_BREVO_API_KEY = "xkeysib_test_contract";
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.method).toBe("POST");
      expect((init?.headers as Record<string, string>)["api-key"]).toBe("xkeysib_test_contract");
      expect(JSON.parse(String(init?.body))).toMatchObject({
        sender: { email: "contact@example.org" },
        to: [{ email: "member@example.org" }],
        subject: "Test",
        textContent: "Message de test",
      });
      return new Response(JSON.stringify({ messageId: "brevo-test-message" }), { status: 201 });
    });

    await expect(sendBrevoEmail({
      sender: { email: "contact@example.org", name: "Association" },
      to: [{ email: "member@example.org", name: "Membre" }],
      subject: "Test",
      textContent: "Message de test",
    }, fetchMock as unknown as typeof fetch)).resolves.toEqual({ messageId: "brevo-test-message" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    if (previousKey === undefined) delete process.env.APP_BREVO_API_KEY;
    else process.env.APP_BREVO_API_KEY = previousKey;
  });
});
