import { describe, expect, it } from "vitest";
import { createLocalSessionToken, verifyLocalSessionToken } from "./local-auth";

describe("local authentication session", () => {
  it("creates and verifies a signed token", () => {
    const token = createLocalSessionToken("local-1");
    expect(verifyLocalSessionToken(token)).toBe("local-1");
  });

  it("rejects tampered or missing tokens", () => {
    const token = createLocalSessionToken("local-1");
    const [payload, signature] = token.split(".");
    expect(verifyLocalSessionToken(`${payload}.${signature}tampered`)).toBeNull();
    expect(verifyLocalSessionToken(undefined)).toBeNull();
  });
});
