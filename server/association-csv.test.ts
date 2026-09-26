import { describe, expect, it } from "vitest";
import { parseAssociationCsv } from "../shared/associationCsv";

describe("association CSV import", () => {
  it("valide un CSV de contacts avec séparateur point-virgule", () => {
    const result = parseAssociationCsv("Prénom;Nom;Email;Statut\nAmina;Mahamat;amina@example.org;active", "contacts");
    expect(result.issues).toHaveLength(0);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0]).toMatchObject({ firstName: "Amina", lastName: "Mahamat", status: "active" });
  });

  it("refuse les dates de projet incohérentes et les responsables invalides au format", () => {
    const result = parseAssociationCsv("name,status,startDate,endDate,leaderId\nProjet,planning,2026-09-20,2026-09-01,abc", "projects");
    expect(result.rows).toHaveLength(0);
    expect(result.issues.some((issue) => issue.message.includes("endDate") || issue.message.includes("leaderId"))).toBe(true);
  });

  it("limite les fichiers trop volumineux en nombre de lignes", () => {
    const csv = ["firstName,lastName,email", ...Array.from({ length: 1001 }, (_, index) => `Nom${index},Test${index},test${index}@example.org`)].join("\n");
    const result = parseAssociationCsv(csv, "members");
    expect(result.issues.some((issue) => issue.message.includes("limite"))).toBe(true);
  });
});
