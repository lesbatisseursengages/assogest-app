import type { Request, Response } from "express";
import { and, eq, gte, lte } from "drizzle-orm";
import { assemblies, assemblyParticipants, members, notificationSchedules, users } from "../drizzle/schema";
import { getDb, getGlobalSettings } from "./db";
import { createUserNotification } from "./notification-center";
import { sdk } from "./_core/sdk";
import { getBrevoApiKey } from "./brevo-config";
import { sendBrevoEmail } from "./brevo";

export async function generateGovernanceReminderNotifications(now = new Date()) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const rows = await db.select().from(assemblies)
    .where(and(eq(assemblies.status, "scheduled"), gte(assemblies.scheduledAt, now.toISOString()), lte(assemblies.scheduledAt, end.toISOString())));
  let created = 0;
  let skipped = 0;
  let emailsSent = 0;
  let emailsSkipped = 0;
  const settings = await getGlobalSettings();
  const senderEmail = settings?.email?.trim();
  const senderName = settings?.associationName?.trim() || "Les Bâtisseurs Engagés";
  const emailConfigured = Boolean(getBrevoApiKey() && senderEmail);
  for (const assembly of rows) {
    if (!assembly.scheduledAt) continue;
    const participantRows = await db.select({ userId: members.userId, email: members.email, name: members.firstName }).from(assemblyParticipants)
      .innerJoin(members, eq(assemblyParticipants.memberId, members.id))
      .where(eq(assemblyParticipants.assemblyId, assembly.id));
    const ownerRows = await db.select({ id: users.id, email: users.email, name: users.name }).from(users).where(eq(users.id, assembly.createdBy)).limit(1);
    const owner = ownerRows[0];
    const recipients = new Map<number, { email?: string | null; name?: string | null }>();
    recipients.set(assembly.createdBy, { email: owner?.email, name: owner?.name });
    for (const participant of participantRows) if (participant.userId) recipients.set(participant.userId, { email: participant.email, name: participant.name });
    const dayKey = now.toISOString().slice(0, 10);
    const scheduledDate = new Date(assembly.scheduledAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
    for (const [userId, recipient] of Array.from(recipients.entries())) {
      const result = await createUserNotification({
        userId,
        title: "Assemblée à venir",
        message: `L’assemblée « ${assembly.title} » est planifiée le ${scheduledDate}. Pensez à vérifier les participants et les résolutions.`,
        type: "info",
        actionUrl: "/governance/dashboard",
        eventKey: "governance.assembly_reminder",
        entityType: "assembly",
        entityId: assembly.id,
        dedupeKey: `governance-assembly:${assembly.id}:${userId}:${dayKey}`,
      });
      if (result.created) created += 1;
      else skipped += 1;
      if (result.created && emailConfigured && recipient.email) {
        try {
          await sendBrevoEmail({
            sender: { email: senderEmail!, name: senderName },
            to: [{ email: recipient.email, name: recipient.name ?? undefined }],
            subject: `Rappel : assemblée « ${assembly.title} »`,
            textContent: `Bonjour${recipient.name ? ` ${recipient.name}` : ""},\n\nL’assemblée « ${assembly.title} » est planifiée le ${scheduledDate}. Consultez votre espace de gouvernance pour vérifier l’ordre du jour, les participants et les résolutions.\n\nLes Bâtisseurs Engagés`,
            tags: ["association", "governance", "assembly_reminder"],
          });
          emailsSent += 1;
        } catch (error) {
          emailsSkipped += 1;
          console.warn("Échec de l’envoi du rappel gouvernance", error);
        }
      } else if (result.created) {
        emailsSkipped += 1;
      }
    }
  }
  return { created, skipped, scanned: rows.length, emailsSent, emailsSkipped, emailConfigured };
}

export async function governanceRemindersHandler(req: Request, res: Response) {
  let taskUid: string | undefined;
  try {
    const user = await sdk.authenticateRequest(req);
    taskUid = user.taskUid;
    if (!user.isCron || !taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "database-unavailable" });
    const schedules = await db.select().from(notificationSchedules).where(eq(notificationSchedules.scheduleCronTaskUid, taskUid)).limit(1);
    const schedule = schedules[0];
    if (!schedule) return res.json({ ok: true, skipped: "orphan" });
    if (schedule.isEnabled === 0) return res.json({ ok: true, skipped: "disabled" });
    const result = await generateGovernanceReminderNotifications();
    await db.update(notificationSchedules).set({ lastRunAt: new Date().toISOString() }).where(eq(notificationSchedules.id, schedule.id));
    return res.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown-error";
    return res.status(500).json({ error: message, context: { url: req.originalUrl, taskUid }, timestamp: new Date().toISOString() });
  }
}
