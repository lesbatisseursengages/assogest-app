import { createHmac, timingSafeEqual } from "node:crypto";
import { ENV } from "./_core/env";

export const LOCAL_SESSION_COOKIE = "asso_local_session";
export const PREVIEW_SESSION_COOKIE = "asso_admin_preview";

function secret() {
  return ENV.cookieSecret || "asso-demo-local-secret";
}

export function createLocalSessionToken(openId: string) {
  const payload = Buffer.from(openId, "utf8").toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyLocalSessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function createPreviewSessionToken(actorId: number, targetId: number) {
  const payload = Buffer.from(`${actorId}:${targetId}`, "utf8").toString("base64url");
  const signature = createHmac("sha256", secret()).update(`preview:${payload}`).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyPreviewSessionToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(`preview:${payload}`).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  const [actorId, targetId] = Buffer.from(payload, "base64url").toString("utf8").split(":").map(Number);
  return Number.isInteger(actorId) && Number.isInteger(targetId) ? { actorId, targetId } : null;
}
