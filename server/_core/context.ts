import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { users } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getUserByOpenId } from "../db";
import { LOCAL_SESSION_COOKIE, verifyLocalSessionToken } from "../local-auth";
import { parse as parseCookieHeader } from "cookie";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: typeof users.$inferSelect | null;
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

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
