import { describe, expect, it } from "vitest";
import { parseMemberCsv } from "./memberCsv";

describe("parseMemberCsv", () => {
  it("parse les CSV séparés par des virgules avec valeurs entre guillemets", () => {
    const result = parseMemberCsv('firstName,lastName,email\n"Awa, Marie",Diallo,awa@example.com');
    expect(result.issues).toEqual([]);
    expect(result.rows[0]).toMatchObject({ firstName: "Awa, Marie", lastName: "Diallo", email: "awa@example.com" });
  });

  it("reconnaît les en-têtes français et le point-virgule", () => {
    const result = parseMemberCsv("Prénom;Nom;Courriel;Statut\nAwa;Diallo;awa@example.com;active");
    expect(result.issues).toEqual([]);
    expect(result.rows[0]).toMatchObject({ firstName: "Awa", lastName: "Diallo", email: "awa@example.com", status: "active" });
  });

  it("signale les lignes invalides et limite le volume", () => {
    const result = parseMemberCsv("firstName,lastName,email\nAwa,,bad-email\nAminata,Diallo,aminata@example.com", 1);
    expect(result.totalRows).toBe(2);
    expect(result.rows).toHaveLength(0);
    expect(result.issues.some((issue) => issue.row === 2)).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes("limite"))).toBe(true);
  });
});
