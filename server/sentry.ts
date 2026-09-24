import * as Sentry from "@sentry/node";

let initialized = false;

export function initializeSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || initialized) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
    tracesSampleRate: 0.1,
  });
  initialized = true;
}

export function captureServerException(error: unknown) {
  if (!initialized) return;
  Sentry.captureException(error);
}

export async function flushSentry(timeout = 2000) {
  if (!initialized) return true;
  return Sentry.flush(timeout);
}
