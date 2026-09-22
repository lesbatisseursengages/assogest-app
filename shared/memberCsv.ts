import { z } from "zod";

export const memberCsvRowSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom obligatoire").max(100),
  lastName: z.string().trim().min(1, "Nom obligatoire").max(100),
  email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  role: z.string().trim().max(100).optional().or(z.literal("")),
  function: z.string().trim().max(100).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "pending", "suspended", "resigned", "deceased", "archived"]).optional(),
  gender: z.enum(["1", "2", "3"]).optional(),
  memberID: z.string().trim().max(20).optional().or(z.literal("")),
  membershipCategory: z.enum(["standard", "etudiant", "bienfaiteur", "fondateur", "actif", "honoraire"]).optional(),
  skills: z.string().trim().optional().or(z.literal("")),
  availability: z.string().trim().max(100).optional().or(z.literal("")),
});

export type MemberCsvRow = z.infer<typeof memberCsvRowSchema>;
export type MemberCsvIssue = { row: number; message: string };

const aliases: Record<string, keyof MemberCsvRow> = {
  firstname: "firstName", prénom: "firstName", prenom: "firstName",
  lastname: "lastName", nom: "lastName", surname: "lastName",
  email: "email", courriel: "email",
  phone: "phone", téléphone: "phone", telephone: "phone", mobile: "phone",
  role: "role", fonction: "function", function: "function",
  status: "status", statut: "status", gender: "gender", genre: "gender",
  memberid: "memberID", identifiant: "memberID", matricule: "memberID",
  membershipcategory: "membershipCategory", categorie: "membershipCategory", catégorie: "membershipCategory",
  skills: "skills", compétences: "skills", competences: "skills",
  availability: "availability", disponibilité: "availability", disponibilite: "availability",
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_-]+/g, "");
}

function parseLine(line: string, delimiter: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && quoted) { value += '"'; i++; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === delimiter && !quoted) { values.push(value.trim()); value = ""; continue; }
    value += char;
  }
  values.push(value.trim());
  return values;
}

export function parseMemberCsv(csv: string, maxRows = 1000): { rows: MemberCsvRow[]; issues: MemberCsvIssue[]; totalRows: number } {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return { rows: [], issues: [{ row: 1, message: "Le CSV doit contenir une ligne d’en-têtes et au moins une ligne." }], totalRows: 0 };
  const delimiter = (lines[0].match(/;/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const headers = parseLine(lines[0], delimiter).map(normalizeHeader);
  const mapped = headers.map((header) => aliases[header]);
  const issues: MemberCsvIssue[] = [];
  const rows: MemberCsvRow[] = [];
  const dataLines = lines.slice(1);
  if (dataLines.length > maxRows) issues.push({ row: maxRows + 2, message: `Le fichier dépasse la limite de ${maxRows} lignes.` });
  const linesToParse = dataLines.slice(0, maxRows);
  for (let index = 0; index < linesToParse.length; index++) {
    const line = linesToParse[index];
    const raw = Object.fromEntries(mapped.map((key, column) => [key, key ? parseLine(line, delimiter)[column] ?? "" : undefined]).filter(([key]) => key));
    const result = memberCsvRowSchema.safeParse(raw);
    if (!result.success) issues.push({ row: index + 2, message: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") });
    else rows.push(result.data);
  }
  return { rows, issues, totalRows: dataLines.length };
}

export const MEMBER_CSV_HEADERS = ["firstName", "lastName", "email", "phone", "role", "function", "status", "gender", "memberID", "membershipCategory", "skills", "availability"];
