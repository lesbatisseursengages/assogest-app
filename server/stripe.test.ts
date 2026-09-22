import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import { stripeWebhookHandler } from "./stripe-webhook";
import { getStripeSecretKey, getStripeWebhookSecret } from "./stripe-config";

const routerSource = readFileSync(new URL("./stripe-router.ts", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");

describe("Stripe integration contract", () => {
  it("exposes the three supported payment types and minimal Checkout metadata", () => {
    expect(routerSource).toContain('z.enum(["cotisation", "don", "campagne"])');
    expect(routerSource).toContain("client_reference_id: String(ctx.user.id)");
    expect(routerSource).toContain('user_id: String(ctx.user.id)');
    expect(routerSource).toContain('payment_type: input.paymentType');
    expect(routerSource).toContain('allow_promotion_codes: true');
    expect(routerSource).toContain('mode: "payment"');
    expect(routerSource).toContain('idempotencyKey: input.idempotencyKey');
  });

  it("reconciles confirmed donations and campaign contributions locally", () => {
    const webhookSource = readFileSync(new URL("./stripe-webhook.ts", import.meta.url), "utf8");
    expect(webhookSource).toContain('db.insert(dons).values');
    expect(webhookSource).toContain('payment.paymentType === "campagne"');
    expect(webhookSource).toContain('await db.insert(transactions).values');
  });

  it("mounts the webhook with a raw body parser before JSON", () => {
    expect(indexSource).toContain('app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);');
    expect(indexSource.indexOf("stripeWebhookHandler")).toBeLessThan(indexSource.indexOf("express.json"));
  });

  it("returns the required verification response for Stripe test events", async () => {
    const payload = JSON.stringify({ id: "evt_test_contract", object: "event", api_version: "2025-01-27.acacia", created: 1_700_000_000, data: { object: {} }, livemode: false, pending_webhooks: 1, request: null, type: "customer.created" });
    const secret = "whsec_contract_test";
    const previousCustomSecret = process.env.APP_STRIPE_SECRET_KEY;
    const previousCustomWebhook = process.env.APP_STRIPE_WEBHOOK_SECRET;
    delete process.env.APP_STRIPE_SECRET_KEY;
    delete process.env.APP_STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_SECRET_KEY = "sk_test_contract";
    process.env.STRIPE_WEBHOOK_SECRET = secret;
    const stripe = new Stripe("sk_test_contract");
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
    const response = {
      status: () => response,
      json: (body: unknown) => body,
    };
    const result = await stripeWebhookHandler({ headers: { "stripe-signature": signature }, body: Buffer.from(payload) } as never, response as never);
    expect(result).toEqual({ verified: true });
    if (previousCustomSecret === undefined) delete process.env.APP_STRIPE_SECRET_KEY;
    else process.env.APP_STRIPE_SECRET_KEY = previousCustomSecret;
    if (previousCustomWebhook === undefined) delete process.env.APP_STRIPE_WEBHOOK_SECRET;
    else process.env.APP_STRIPE_WEBHOOK_SECRET = previousCustomWebhook;
  });

  it("supports project-specific WebDev secret names without storing credentials in the database", () => {
    const previousSecret = process.env.STRIPE_SECRET_KEY;
    const previousWebhook = process.env.STRIPE_WEBHOOK_SECRET;
    const previousCustomSecret = process.env.APP_STRIPE_SECRET_KEY;
    const previousCustomWebhook = process.env.APP_STRIPE_WEBHOOK_SECRET;
    process.env.APP_STRIPE_SECRET_KEY = "sk_test_custom";
    process.env.APP_STRIPE_WEBHOOK_SECRET = "whsec_custom";
    process.env.STRIPE_SECRET_KEY = "sk_test_legacy";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_legacy";
    expect(getStripeSecretKey()).toBe("sk_test_custom");
    expect(getStripeWebhookSecret()).toBe("whsec_custom");
    if (previousSecret === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousSecret;
    if (previousWebhook === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = previousWebhook;
    if (previousCustomSecret === undefined) delete process.env.APP_STRIPE_SECRET_KEY;
    else process.env.APP_STRIPE_SECRET_KEY = previousCustomSecret;
    if (previousCustomWebhook === undefined) delete process.env.APP_STRIPE_WEBHOOK_SECRET;
    else process.env.APP_STRIPE_WEBHOOK_SECRET = previousCustomWebhook;
  });

  it("authenticates the configured Stripe test key against the account endpoint", async () => {
    const secretKey = process.env.APP_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    expect(secretKey, "Le secret Stripe de test doit être configuré dans les secrets WebDev.").toMatch(/^sk_test_/);
    const response = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    expect(response.ok, `Stripe a refusé la clé de test avec HTTP ${response.status}.`).toBe(true);
  });
});
