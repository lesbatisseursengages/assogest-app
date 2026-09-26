import { z } from "zod";
import { parseMemberCsv, type MemberCsvRow } from "./memberCsv";

export type ImportEntity = "members" | "contacts" | "donations" | "projects";
export type CsvIssue = { row: number; message: string };

type ParsedResult = { rows: Record<string, unknown>[]; issues: CsvIssue[]; totalRows: number; sample: Record<string, unknown>[] };

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom obligatoire").max(100),
  lastName: z.string().trim().min(1, "Nom obligatoire").max(100),
  email: z.string().trim().email("Email invalide"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  company: z.string().trim().max(255).optional().or(z.literal("")),
  position: z.string().trim().max(100).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  segment: z.string().trim().max(50).optional().or(z.literal("")),
  status: z.enum(["prospect", "active", "inactive", "archived"]).optional(),
});

const donationSchema = z.object({
  donateur: z.string().trim().min(1, "Donateur obligatoire").max(255),
  montant: z.string().trim().regex(/^\d+(?:[.,]\d{1,2})?$/, "Montant invalide"),
  currency: z.enum(["EUR", "XOF"]).default("XOF"),
  email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().trim().max(20).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  date: z.string().trim().optional().or(z.literal("")),
});

const optionalDate = z.string().trim().refine((value) => !value || !Number.isNaN(Date.parse(value)), "Date invalide").optional().or(z.literal(""));
const optionalNumber = z.string().trim().refine((value) => !value || Number.isFinite(Number(value)), "Nombre invalide").optional().or(z.literal(""));

const projectSchema = z.object({
  name: z.string().trim().min(1, "Nom obligatoire").max(255),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  status: z.enum(["planning", "in-progress", "on-hold", "completed", "archived"]).default("planning"),
  startDate: optionalDate,
  endDate: optionalDate,
  budget: optionalNumber,
  leaderId: z.string().trim().regex(/^\d+$/, "leaderId doit être un identifiant numérique"),
  locationLabel: z.string().trim().max(255).optional().or(z.literal("")),
  latitude: optionalNumber,
  longitude: optionalNumber,
}).superRefine((value, context) => {
  if (value.startDate && value.endDate && new Date(value.endDate) < new Date(value.startDate)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "La fin doit être postérieure au début" });
  }
});

const aliases: Record<string, string> = {
  firstname: "firstName", prénom: "firstName", prenom: "firstName", lastname: "lastName", nom: "lastName",
  email: "email", courriel: "email", phone: "phone", téléphone: "phone", telephone: "phone", mobile: "phone",
  company: "company", entreprise: "company", position: "position", poste: "position", city: "city", ville: "city",
  country: "country", pays: "country", segment: "segment", status: "status", statut: "status",
  donateur: "donateur", donor: "donateur", montant: "montant", amount: "montant", currency: "currency", devise: "currency",
  description: "description", date: "date", name: "name", titre: "name",
  startdate: "startDate", début: "startDate", debut: "startDate", enddate: "endDate", fin: "endDate",
  budget: "budget", leaderid: "leaderId", responsable: "leaderId", locationlabel: "locationLabel", lieu: "locationLabel",
  latitude: "latitude", longitude: "longitude",
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_-]+/g, "");
}

function parseLine(line: string, delimiter: string) {
  const values: string[] = []; let value = ""; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && quoted) { value += '"'; i++; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === delimiter && !quoted) { values.push(value.trim()); value = ""; continue; }
    value += char;
  }
  values.push(value.trim()); return values;
}

export function parseAssociationCsv(csv: string, entity: ImportEntity, maxRows = 1000): ParsedResult {
  if (entity === "members") {
    const parsed = parseMemberCsv(csv, maxRows);
    return { rows: parsed.rows as unknown as Record<string, unknown>[], issues: parsed.issues, totalRows: parsed.totalRows, sample: parsed.rows.slice(0, 5) as unknown as Record<string, unknown>[] };
  }
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { rows: [], issues: [{ row: 1, message: "Le CSV doit contenir des en-têtes et au moins une ligne." }], totalRows: 0, sample: [] };
  const delimiter = (lines[0].match(/;/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const keys = parseLine(lines[0], delimiter).map((header) => aliases[normalizeHeader(header)]);
  const issues: CsvIssue[] = []; const rows: Record<string, unknown>[] = [];
  const schema = entity === "contacts" ? contactSchema : entity === "donations" ? donationSchema : projectSchema;
  const dataLines = lines.slice(1);
  if (dataLines.length > maxRows) issues.push({ row: maxRows + 2, message: `Le fichier dépasse la limite de ${maxRows} lignes.` });
  const linesToParse = dataLines.slice(0, maxRows);
  for (let index = 0; index < linesToParse.length; index++) {
    const line = linesToParse[index];
    const values = parseLine(line, delimiter);
    const raw = Object.fromEntries(keys.map((key, column) => [key, values[column] ?? ""]).filter(([key]) => key));
    const parsed = schema.safeParse(raw);
    if (!parsed.success) issues.push({ row: index + 2, message: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") });
    else rows.push(parsed.data as Record<string, unknown>);
  }
  return { rows, issues, totalRows: dataLines.length, sample: rows.slice(0, 5) };
}

export const ASSOCIATION_CSV_HEADERS: Record<ImportEntity, string[]> = {
  members: ["firstName", "lastName", "email", "phone", "role", "function", "status", "memberID", "membershipCategory"],
  contacts: ["firstName", "lastName", "email", "phone", "company", "position", "city", "country", "segment", "status"],
  donations: ["donateur", "montant", "currency", "email", "telephone", "description", "date"],
  projects: ["name", "description", "status", "startDate", "endDate", "budget", "leaderId", "locationLabel", "latitude", "longitude"],
};

export type { MemberCsvRow };
