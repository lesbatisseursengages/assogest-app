const CUSTOM_SECRET_KEY = "APP_STRIPE_SECRET_KEY";
const CUSTOM_WEBHOOK_SECRET = "APP_STRIPE_WEBHOOK_SECRET";

/**
 * Resolve Stripe credentials without storing them in the database or browser.
 * Custom names are supported because some WebDev environments reserve the
 * built-in STRIPE_* variables for their own integration lifecycle.
 */
export function getStripeSecretKey() {
  return process.env[CUSTOM_SECRET_KEY] || process.env.STRIPE_SECRET_KEY || "";
}

export function getStripeWebhookSecret() {
  return process.env[CUSTOM_WEBHOOK_SECRET] || process.env.STRIPE_WEBHOOK_SECRET || "";
}

export const stripeSecretEnvNames = {
  secretKey: CUSTOM_SECRET_KEY,
  webhookSecret: CUSTOM_WEBHOOK_SECRET,
} as const;
