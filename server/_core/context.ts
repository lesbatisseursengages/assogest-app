import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { users } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getUserByOpenId, getUserById } from "../db";
import { LOCAL_SESSION_COOKIE, PREVIEW_SESSION_COOKIE, verifyLocalSessionToken, verifyPreviewSessionToken } from "../local-auth";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: typeof users.$inferSelect | null;
  actorUser?: typeof users.$inferSelect | null;
  isPreview?: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: typeof users.$inferSelect | null = null;

  const cookies = opts.req.cookies ?? parseCookieHeader(opts.req.headers.cookie ?? "");
  const localOpenId = verifyLocalSessionToken(cookies[LOCAL_SESSION_COOKIE]);
  if (localOpenId) {
    user = (await getUserByOpenId(localOpenId)) ?? null;
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  const actorUser = user;
  const preview = actorUser?.role === "admin" ? verifyPreviewSessionToken(cookies[PREVIEW_SESSION_COOKIE]) : null;
  if (preview && preview.actorId === actorUser?.id) {
    const targetUser = await getUserById(preview.targetId);
    if (targetUser && targetUser.role !== "admin") user = targetUser;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    actorUser,
    isPreview: Boolean(preview && preview.actorId === actorUser?.id && user?.id === preview.targetId),
  };
}
