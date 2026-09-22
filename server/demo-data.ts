import { and, eq, inArray, like } from "drizzle-orm";
import {
  adhesions,
  announcements,
  assemblies,
  assemblyParticipants,
  assemblyProxies,
  assemblyResolutions,
  assemblyVotes,
  campaigns,
  categories,
  crmActivities,
  crmContacts,
  depenses,
  documents,
  dons,
  events,
  members,
  notifications,
  projectBudgetItems,
  projectMembers,
  projectMilestones,
  projectTaskComments,
  projectTasks,
  projectUpdates,
  projects,
  transactions,
} from "../drizzle/schema";
import { getDb } from "./db";

const DEMO_MARKER = "demo-2026";
const DEMO_LABEL = "[DÉMO 2026]";
const DEMO_TEXT_PATTERN = `%${DEMO_LABEL}%`;

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const dateDaysAgo = (days: number) => daysAgo(days).slice(0, 10);

const contactsData = [
  { firstName: "Amina", lastName: "Mahamat", email: "amina.mahamat@demo.lesbatisseurs.td", phone: "+235 66 21 45 08", company: "Solidarité Sahel", position: "Coordinatrice humanitaire", address: "Rue 1032, quartier Moursal", city: "N'Djamena", country: "Tchad", segment: "partenaire", status: "active" as const, notes: `${DEMO_LABEL} Partenaire opérationnel pour les actions de terrain.`, tags: `${DEMO_MARKER},partenaire,humanitaire`, engagementScore: 92, joinDate: dateDaysAgo(520), lastInteraction: daysAgo(3) },
  { firstName: "Moussa", lastName: "Adamou", email: "moussa.adamou@demo.lesbatisseurs.td", phone: "+235 65 18 73 42", company: "Atelier Jeunesse de Farcha", position: "Responsable formation", address: "Farcha, secteur 4", city: "N'Djamena", country: "Tchad", segment: "partenaire", status: "active" as const, notes: `${DEMO_LABEL} Relais local pour le centre de formation professionnelle.`, tags: `${DEMO_MARKER},partenaire,formation`, engagementScore: 84, joinDate: dateDaysAgo(390), lastInteraction: daysAgo(12) },
  { firstName: "Fatimé", lastName: "Hassan", email: "fatime.hassan@demo.lesbatisseurs.td", phone: "+235 68 40 12 76", company: "", position: "Bénéficiaire", address: "Walia, carré 18", city: "N'Djamena", country: "Tchad", segment: "beneficiaire", status: "active" as const, notes: `${DEMO_LABEL} Famille accompagnée dans le programme d'aide sociale.`, tags: `${DEMO_MARKER},beneficiaire,aide-sociale`, engagementScore: 71, joinDate: dateDaysAgo(240), lastInteraction: daysAgo(9) },
  { firstName: "Haroun", lastName: "Saleh", email: "haroun.saleh@demo.lesbatisseurs.td", phone: "+235 62 09 33 51", company: "", position: "Donateur individuel", address: "Sabangali, rue 12", city: "N'Djamena", country: "Tchad", segment: "donateur", status: "active" as const, notes: `${DEMO_LABEL} Donateur régulier mobilisé sur les urgences climatiques.`, tags: `${DEMO_MARKER},donateur,urgence`, engagementScore: 78, joinDate: dateDaysAgo(180), lastInteraction: daysAgo(18) },
  { firstName: "Clémence", lastName: "Ngarlembaye", email: "clemence.ngarlembaye@demo.lesbatisseurs.td", phone: "+235 67 55 08 29", company: "", position: "Bénévole logistique", address: "Klemat, avenue Mobutu", city: "N'Djamena", country: "Tchad", segment: "benevole", status: "active" as const, notes: `${DEMO_LABEL} Bénévole disponible les week-ends pour la logistique.`, tags: `${DEMO_MARKER},benevole,logistique`, engagementScore: 88, joinDate: dateDaysAgo(300), lastInteraction: daysAgo(2) },
  { firstName: "Youssouf", lastName: "Abakar", email: "youssouf.abakar@demo.lesbatisseurs.td", phone: "+235 69 11 64 20", company: "Sahel Équipement", position: "Gérant", address: "Zone industrielle, lot 7", city: "N'Djamena", country: "Tchad", segment: "fournisseur", status: "prospect" as const, notes: `${DEMO_LABEL} Prospect fournisseur de kits et équipements de terrain.`, tags: `${DEMO_MARKER},prospect,fournisseur`, engagementScore: 46, joinDate: dateDaysAgo(45), lastInteraction: daysAgo(21) },
  { firstName: "Nadège", lastName: "Koudjina", email: "nadege.koudjina@demo.lesbatisseurs.td", phone: "+235 66 73 20 14", company: "Fondation Horizon Afrique", position: "Chargée de programme", address: "Quartier Sabangali", city: "N'Djamena", country: "Tchad", segment: "bailleur", status: "active" as const, notes: `${DEMO_LABEL} Échange en cours pour un financement du centre de formation.`, tags: `${DEMO_MARKER},bailleur,financement`, engagementScore: 89, joinDate: dateDaysAgo(90), lastInteraction: daysAgo(1) },
  { firstName: "Abdoulaye", lastName: "Brahim", email: "abdoulaye.brahim@demo.lesbatisseurs.td", phone: "+235 63 88 45 02", company: "Comité de quartier Walia", position: "Représentant communautaire", address: "Walia, carré 6", city: "N'Djamena", country: "Tchad", segment: "beneficiaire", status: "inactive" as const, notes: `${DEMO_LABEL} Contact communautaire historique, à relancer avant la saison des pluies.`, tags: `${DEMO_MARKER},communaute,walia`, engagementScore: 32, joinDate: dateDaysAgo(650), lastInteraction: daysAgo(75) },
] as const;

const membersData = [
  { firstName: "Mariam", lastName: "Ali", email: "mariam.ali@demo.lesbatisseurs.td", phone: "+235 66 10 02 41", role: "Présidente", function: "Présidente du bureau", status: "active" as const, memberRole: "admin" as const, gender: "2" as const, memberId: "DEMO-2026-001", membershipCategory: "fondateur" as const, skills: "Pilotage associatif, plaidoyer", availability: "Semaine" },
  { firstName: "Brahim", lastName: "Mahamat", email: "brahim.mahamat@demo.lesbatisseurs.td", phone: "+235 67 22 19 30", role: "Trésorier", function: "Gestion financière", status: "active" as const, memberRole: "admin" as const, gender: "1" as const, memberId: "DEMO-2026-002", membershipCategory: "actif" as const, skills: "Comptabilité, suivi budgétaire", availability: "Soirées" },
  { firstName: "Hindou", lastName: "Saleh", email: "hindou.saleh@demo.lesbatisseurs.td", phone: "+235 68 14 70 25", role: "Secrétaire générale", function: "Administration et archives", status: "active" as const, memberRole: "secretary" as const, gender: "2" as const, memberId: "DEMO-2026-003", membershipCategory: "actif" as const, skills: "Rédaction, organisation", availability: "Semaine" },
  { firstName: "Idriss", lastName: "Kebir", email: "idriss.kebir@demo.lesbatisseurs.td", phone: "+235 62 45 32 18", role: "Responsable terrain", function: "Coordination des activités", status: "active" as const, memberRole: "member" as const, gender: "1" as const, memberId: "DEMO-2026-004", membershipCategory: "actif" as const, skills: "Mobilisation communautaire", availability: "Week-ends" },
  { firstName: "Aïcha", lastName: "Oumar", email: "aicha.oumar@demo.lesbatisseurs.td", phone: "+235 69 08 22 11", role: "Membre", function: "Appui social", status: "inactive" as const, memberRole: "member" as const, gender: "2" as const, memberId: "DEMO-2026-005", membershipCategory: "standard" as const, skills: "Écoute, accompagnement", availability: "Ponctuelle" },
  { firstName: "Salim", lastName: "Djarma", email: "salim.djarma@demo.lesbatisseurs.td", phone: "+235 66 91 03 57", role: "Membre", function: "Communication", status: "inactive" as const, memberRole: "member" as const, gender: "1" as const, memberId: "DEMO-2026-006", membershipCategory: "etudiant" as const, skills: "Communication digitale", availability: "Vacances" },
] as const;

const projectsData = [
  { name: `${DEMO_LABEL} Résilience face aux inondations`, description: `${DEMO_LABEL} Distribution de kits d'urgence, sensibilisation et appui aux familles vulnérables de Walia pendant la saison des pluies.`, status: "in-progress" as const, startDate: daysAgo(75), endDate: daysAgo(-35), budget: "18500000", leaderMemberId: "DEMO-2026-004", locationLabel: "Walia, N’Djamena", latitude: "12.1048", longitude: "15.0846" },
  { name: `${DEMO_LABEL} Centre de formation de Farcha`, description: `${DEMO_LABEL} Mise en place d'un espace de formation courte en couture, maintenance solaire et gestion de micro-activité pour 60 jeunes.`, status: "planning" as const, startDate: daysAgo(-20), endDate: daysAgo(-210), budget: "32750000", leaderMemberId: "DEMO-2026-003", locationLabel: "Farcha, N’Djamena", latitude: "12.1516", longitude: "15.0066" },
  { name: `${DEMO_LABEL} Aide sociale Ramadan 2026`, description: `${DEMO_LABEL} Accompagnement alimentaire et social de 120 ménages à faibles revenus dans trois quartiers de N'Djamena.`, status: "completed" as const, startDate: daysAgo(205), endDate: daysAgo(145), budget: "9600000", leaderMemberId: "DEMO-2026-001", locationLabel: "Moundou, Tchad", latitude: "8.5667", longitude: "16.0833" },
] as const;

const documentsData = [
  { title: "Statuts de l'association — version adoptée", description: `${DEMO_LABEL} Statuts officiels adoptés lors de l'assemblée constitutive.`, categorySlug: "demo-2026-statuts", categoryName: "Statuts", status: "completed" as const, priority: "high" as const, dueDate: daysAgo(-365) },
  { title: "PV Assemblée générale ordinaire — mars 2026", description: `${DEMO_LABEL} Procès-verbal signé et classé après l'assemblée générale ordinaire.`, categorySlug: "demo-2026-pv", categoryName: "Procès-verbaux", status: "completed" as const, priority: "medium" as const, dueDate: daysAgo(170) },
  { title: "Rapport d'activité — exercice 2025", description: `${DEMO_LABEL} Bilan narratif et financier des actions conduites en 2025.`, categorySlug: "demo-2026-rapports", categoryName: "Rapports d'activité", status: "completed" as const, priority: "high" as const, dueDate: daysAgo(120) },
  { title: "Facture kits hygiène — Sahel Équipement", description: `${DEMO_LABEL} Facture fournisseur liée à la campagne de résilience face aux inondations.`, categorySlug: "demo-2026-factures", categoryName: "Factures", status: "in-progress" as const, priority: "urgent" as const, dueDate: daysAgo(-4) },
  { title: "Rapport intermédiaire centre de formation", description: `${DEMO_LABEL} Rapport à compléter avec les indicateurs de recrutement des bénéficiaires.`, categorySlug: "demo-2026-rapports", categoryName: "Rapports d'activité", status: "in-progress" as const, priority: "high" as const, dueDate: daysAgo(-12) },
  { title: "PV réunion de coordination — août 2026", description: `${DEMO_LABEL} Compte rendu de la réunion de coordination des responsables de projet.`, categorySlug: "demo-2026-pv", categoryName: "Procès-verbaux", status: "pending" as const, priority: "medium" as const, dueDate: daysAgo(-7) },
  { title: "Facture location salle — atelier Farcha", description: `${DEMO_LABEL} Pièce justificative en attente de classement comptable.`, categorySlug: "demo-2026-factures", categoryName: "Factures", status: "pending" as const, priority: "urgent" as const, dueDate: daysAgo(2) },
  { title: "Rapport de mission — quartier Walia", description: `${DEMO_LABEL} Rapport terrain sur les besoins prioritaires identifiés auprès des familles.`, categorySlug: "demo-2026-rapports", categoryName: "Rapports d'activité", status: "completed" as const, priority: "low" as const, dueDate: daysAgo(30) },
] as const;

const donationsData = [
  { donor: "Haroun Saleh", email: "haroun.saleh@demo.lesbatisseurs.td", phone: "+235 62 09 33 51", amount: "250000", date: daysAgo(70), description: `${DEMO_LABEL} Don validé — soutien urgence inondations.` },
  { donor: "Fondation Horizon Afrique", email: "nadege.koudjina@demo.lesbatisseurs.td", phone: "+235 66 73 20 14", amount: "1500000", date: daysAgo(42), description: `${DEMO_LABEL} Don validé — première tranche centre de formation.` },
  { donor: "Solidarité Sahel", email: "amina.mahamat@demo.lesbatisseurs.td", phone: "+235 66 21 45 08", amount: "750000", date: daysAgo(18), description: `${DEMO_LABEL} Don validé — kits d'hygiène et mobilisation.` },
  { donor: "Moussa Adamou", email: "moussa.adamou@demo.lesbatisseurs.td", phone: "+235 65 18 73 42", amount: "125000", date: daysAgo(4), description: `${DEMO_LABEL} Don en attente de confirmation bancaire.` },
] as const;

const expensesData = [
  { description: `${DEMO_LABEL} Achat de kits hygiène et bâches`, amount: "420000", category: "Urgence et solidarité", date: daysAgo(64), notes: `${DEMO_LABEL} Statut : validé. Projet inondations.`, approved: true },
  { description: `${DEMO_LABEL} Location salle atelier Farcha`, amount: "180000", category: "Formation", date: daysAgo(28), notes: `${DEMO_LABEL} Statut : en attente de pièce justificative.`, approved: false },
  { description: `${DEMO_LABEL} Transport des équipes terrain`, amount: "95000", category: "Missions", date: daysAgo(11), notes: `${DEMO_LABEL} Statut : validé. Déplacement Walia.`, approved: true },
  { description: `${DEMO_LABEL} Impression supports sensibilisation`, amount: "65000", category: "Communication", date: daysAgo(3), notes: `${DEMO_LABEL} Statut : rejeté, devis à revoir.`, approved: false },
] as const;

const activitiesData = [
  { contactEmail: "amina.mahamat@demo.lesbatisseurs.td", type: "meeting" as const, title: "Réunion de cadrage résilience inondations", description: `${DEMO_LABEL} Validation du calendrier de distribution avec Solidarité Sahel.`, status: "completed" as const, priority: "high" as const, days: 3 },
  { contactEmail: "nadege.koudjina@demo.lesbatisseurs.td", type: "email" as const, title: "Envoi du budget centre de formation", description: `${DEMO_LABEL} Budget détaillé et note conceptuelle transmis pour instruction.`, status: "completed" as const, priority: "high" as const, days: 1 },
  { contactEmail: "haroun.saleh@demo.lesbatisseurs.td", type: "call" as const, title: "Appel de suivi du don", description: `${DEMO_LABEL} Confirmation attendue du virement de soutien.`, status: "pending" as const, priority: "medium" as const, days: 0 },
  { contactEmail: "fatime.hassan@demo.lesbatisseurs.td", type: "meeting" as const, title: "Entretien de suivi social", description: `${DEMO_LABEL} Point sur l'accès aux kits alimentaires et les besoins du ménage.`, status: "completed" as const, priority: "medium" as const, days: 9 },
  { contactEmail: "youssouf.abakar@demo.lesbatisseurs.td", type: "call" as const, title: "Qualification fournisseur", description: `${DEMO_LABEL} Vérification des délais de livraison et des conditions de paiement.`, status: "cancelled" as const, priority: "low" as const, days: 21 },
  { contactEmail: "clemence.ngarlembaye@demo.lesbatisseurs.td", type: "email" as const, title: "Planning bénévoles week-end", description: `${DEMO_LABEL} Répartition des permanences logistiques de septembre.`, status: "completed" as const, priority: "medium" as const, days: 2 },
] as const;

const campaignsData = [
  { title: "Kits d'urgence — Saison des pluies 2026", description: `${DEMO_LABEL} Collecte pour financer 250 kits d'hygiène et bâches pour les familles de Walia.`, objectif: "12500000", montantCollecte: "8475000", startDays: 55, endDays: -38, status: "active" as const },
  { title: "Un métier pour chaque jeune de Farcha", description: `${DEMO_LABEL} Campagne de financement du centre de formation professionnelle.`, objectif: "30000000", montantCollecte: "11200000", startDays: 20, endDays: -180, status: "active" as const },
  { title: "Ramadan solidaire 2026", description: `${DEMO_LABEL} Soutien alimentaire et social pour 120 ménages à faibles revenus.`, objectif: "9000000", montantCollecte: "9000000", startDays: 210, endDays: 140, status: "completed" as const },
  { title: "Bibliothèque mobile des quartiers", description: `${DEMO_LABEL} Préparation d'une campagne de mobilisation de livres et de fournitures scolaires.`, objectif: "6000000", montantCollecte: "0", startDays: -15, endDays: -120, status: "draft" as const },
] as const;

const adhesionData = [
  { memberKey: "DEMO-2026-001", amount: "50000", status: "active" as const, type: "annuelle" as const, startDays: 120, endDays: -245, payment: "virement" as const },
  { memberKey: "DEMO-2026-002", amount: "50000", status: "active" as const, type: "annuelle" as const, startDays: 95, endDays: -220, payment: "virement" as const },
  { memberKey: "DEMO-2026-003", amount: "30000", status: "active" as const, type: "annuelle" as const, startDays: 70, endDays: -195, payment: "especes" as const },
  { memberKey: "DEMO-2026-004", amount: "25000", status: "pending" as const, type: "semestrielle" as const, startDays: 12, endDays: -170, payment: "autre" as const },
  { memberKey: "DEMO-2026-005", amount: "20000", status: "expired" as const, type: "annuelle" as const, startDays: 480, endDays: 115, payment: "cheque" as const },
  { memberKey: "DEMO-2026-006", amount: "15000", status: "cancelled" as const, type: "mensuelle" as const, startDays: 230, endDays: 200, payment: "autre" as const },
] as const;

const eventsData = [
  { title: "Réunion mensuelle du bureau", description: `${DEMO_LABEL} Revue des finances, projets et décisions opérationnelles.`, location: "Siège — N'Djamena", eventType: "reunion" as const, startDays: 2, durationHours: 2, organizer: "Mariam Ali", attendees: 8 },
  { title: "Atelier de sensibilisation aux inondations", description: `${DEMO_LABEL} Sensibilisation des familles et démonstration des gestes de prévention.`, location: "Maison de quartier Walia", eventType: "formation" as const, startDays: -12, durationHours: 4, organizer: "Idriss Kebir", attendees: 45 },
  { title: "Distribution de kits à Walia", description: `${DEMO_LABEL} Action de terrain auprès des ménages accompagnés.`, location: "Walia, carré 6", eventType: "activite" as const, startDays: -28, durationHours: 5, organizer: "Idriss Kebir", attendees: 18 },
  { title: "Assemblée générale ordinaire 2026", description: `${DEMO_LABEL} Présentation du rapport moral, financier et renouvellement du bureau.`, location: "Centre culturel de N'Djamena", eventType: "evenement" as const, startDays: -95, durationHours: 3, organizer: "Mariam Ali", attendees: 32 },
  { title: "Point bailleur centre de formation", description: `${DEMO_LABEL} Réunion de suivi avec Fondation Horizon Afrique.`, location: "Visioconférence", eventType: "reunion" as const, startDays: -4, durationHours: 1, organizer: "Hindou Saleh", attendees: 5 },
] as const;

const assembliesData = [
  { title: "Assemblée générale ordinaire — bilan 2025", description: `${DEMO_LABEL} Présentation du rapport moral, financier et du plan d'action 2026.`, type: "ordinary" as const, status: "closed" as const, days: 150, quorum: 50 },
  { title: "Réunion extraordinaire — centre de formation", description: `${DEMO_LABEL} Validation du budget d'investissement et de la convention de partenariat.`, type: "extraordinary" as const, status: "open" as const, days: -8, quorum: 60 },
  { title: "Assemblée de suivi — saison des pluies", description: `${DEMO_LABEL} Point de décision sur les interventions d'urgence à Walia.`, type: "ordinary" as const, status: "scheduled" as const, days: -28, quorum: 50 },
] as const;

const announcementData = [
  { title: "Ouverture des inscriptions aux ateliers de Farcha", content: `${DEMO_LABEL} Les inscriptions aux ateliers de couture et de maintenance solaire sont ouvertes. Les responsables d'équipe peuvent transmettre les candidatures avant la prochaine réunion.`, category: "Formation", priority: "high" as const, status: "published" as const, publishedDays: 5, expiresDays: -45 },
  { title: "Appel à bénévoles pour la distribution de kits", content: `${DEMO_LABEL} L'équipe terrain recherche huit bénévoles pour la distribution prévue à Walia. Une briefing logistique sera organisé la veille.`, category: "Terrain", priority: "urgent" as const, status: "published" as const, publishedDays: 2, expiresDays: -12 },
  { title: "Compte rendu de la réunion du bureau", content: `${DEMO_LABEL} Le compte rendu est disponible pour relecture avant archivage dans les documents administratifs.`, category: "Vie associative", priority: "medium" as const, status: "draft" as const, publishedDays: 0, expiresDays: -60 },
  { title: "Remerciements aux donateurs du Ramadan solidaire", content: `${DEMO_LABEL} L'association remercie les partenaires et donateurs ayant permis d'accompagner 120 ménages.`, category: "Partenariats", priority: "low" as const, status: "archived" as const, publishedDays: 95, expiresDays: 20 },
] as const;

const notificationData = [
  { title: "Document urgent à compléter", message: `${DEMO_LABEL} La facture de location de la salle Farcha attend encore sa pièce justificative.`, type: "warning" as const, isRead: 0, actionUrl: "/documents", entityType: "document", eventKey: "demo-document-urgent", days: 1 },
  { title: "Nouvelle activité CRM assignée", message: `${DEMO_LABEL} L'appel de suivi du donateur Haroun Saleh nécessite une confirmation.`, type: "info" as const, isRead: 0, actionUrl: "/crm/activities", entityType: "crm_activity", eventKey: "demo-crm-followup", days: 0 },
  { title: "Assemblée extraordinaire ouverte", message: `${DEMO_LABEL} La résolution sur le budget du centre de formation est prête pour consultation.`, type: "success" as const, isRead: 1, actionUrl: "/governance", entityType: "assembly", eventKey: "demo-assembly-open", days: 8 },
  { title: "Campagne proche de son objectif", message: `${DEMO_LABEL} La campagne Kits d'urgence a collecté plus de 67 % de son objectif.`, type: "success" as const, isRead: 1, actionUrl: "/campaigns", entityType: "campaign", eventKey: "demo-campaign-progress", days: 4 },
  { title: "Rappel réunion de bureau", message: `${DEMO_LABEL} La prochaine réunion mensuelle est prévue dans deux jours au siège.`, type: "info" as const, isRead: 0, actionUrl: "/events", entityType: "event", eventKey: "demo-office-meeting", days: 2 },
  { title: "Adhésion en attente de paiement", message: `${DEMO_LABEL} L'adhésion de l'équipe terrain doit être régularisée avant validation.`, type: "warning" as const, isRead: 0, actionUrl: "/members/adhesions", entityType: "adhesion", eventKey: "demo-adhesion-pending", days: 12 },
] as const;

async function getDatabase() {
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible");
  return db;
}

async function findContactId(tx: any, email: string) {
  const rows = await tx.select({ id: crmContacts.id }).from(crmContacts).where(eq(crmContacts.email, email)).limit(1);
  return rows[0]?.id as number | undefined;
}

async function findMemberId(tx: any, memberId: string) {
  const rows = await tx.select({ id: members.id }).from(members).where(eq(members.memberId, memberId)).limit(1);
  return rows[0]?.id as number | undefined;
}

async function getOrCreateCategory(tx: any, slug: string, name: string, userId: number) {
  const existing = await tx.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
  if (existing[0]?.id) return existing[0].id as number;
  const result = await tx.insert(categories).values({ name, slug, description: `${DEMO_LABEL} Catégorie créée pour les scénarios de démonstration.`, color: "#1a4d2e", icon: "folder", sortOrder: 90, createdAt: daysAgo(90) });
  return Number((result as any)[0].insertId);
}

export async function resetDemoData() {
  const db = await getDatabase();
  return db.transaction(async (tx: any) => {
    const demoContacts = await tx.select({ id: crmContacts.id }).from(crmContacts).where(like(crmContacts.tags, `%${DEMO_MARKER}%`));
    const contactIds = demoContacts.map((row: { id: number }) => row.id);
    if (contactIds.length > 0) {
      await tx.delete(crmActivities).where(inArray(crmActivities.contactId, contactIds));
    }

    const demoProjects = await tx.select({ id: projects.id }).from(projects).where(like(projects.description, DEMO_TEXT_PATTERN));
    const projectIds = demoProjects.map((row: { id: number }) => row.id);
    if (projectIds.length > 0) {
      await tx.delete(projectTaskComments).where(inArray(projectTaskComments.projectId, projectIds));
      await tx.delete(projectTasks).where(inArray(projectTasks.projectId, projectIds));
      await tx.delete(projectMilestones).where(inArray(projectMilestones.projectId, projectIds));
      await tx.delete(projectBudgetItems).where(inArray(projectBudgetItems.projectId, projectIds));
      await tx.delete(projectUpdates).where(inArray(projectUpdates.projectId, projectIds));
      await tx.delete(projectMembers).where(inArray(projectMembers.projectId, projectIds));
    }
    await tx.delete(projects).where(like(projects.description, DEMO_TEXT_PATTERN));
    const demoAssemblies = await tx.select({ id: assemblies.id }).from(assemblies).where(like(assemblies.description, DEMO_TEXT_PATTERN));
    const assemblyIds = demoAssemblies.map((row: { id: number }) => row.id);
    if (assemblyIds.length > 0) {
      const demoResolutions = await tx.select({ id: assemblyResolutions.id }).from(assemblyResolutions).where(inArray(assemblyResolutions.assemblyId, assemblyIds));
      const resolutionIds = demoResolutions.map((row: { id: number }) => row.id);
      if (resolutionIds.length > 0) await tx.delete(assemblyVotes).where(inArray(assemblyVotes.resolutionId, resolutionIds));
      await tx.delete(assemblyResolutions).where(inArray(assemblyResolutions.assemblyId, assemblyIds));
      await tx.delete(assemblyProxies).where(inArray(assemblyProxies.assemblyId, assemblyIds));
      await tx.delete(assemblyParticipants).where(inArray(assemblyParticipants.assemblyId, assemblyIds));
    }
    await tx.delete(assemblies).where(like(assemblies.description, DEMO_TEXT_PATTERN));
    await tx.delete(campaigns).where(like(campaigns.description, DEMO_TEXT_PATTERN));
    await tx.delete(adhesions).where(like(adhesions.notes, DEMO_TEXT_PATTERN));
    await tx.delete(events).where(like(events.description, DEMO_TEXT_PATTERN));
    await tx.delete(announcements).where(like(announcements.content, DEMO_TEXT_PATTERN));
    await tx.delete(notifications).where(like(notifications.message, DEMO_TEXT_PATTERN));
    await tx.delete(transactions).where(like(transactions.description, DEMO_TEXT_PATTERN));
    await tx.delete(dons).where(like(dons.description, DEMO_TEXT_PATTERN));
    await tx.delete(depenses).where(like(depenses.description, DEMO_TEXT_PATTERN));
    await tx.delete(documents).where(like(documents.description, DEMO_TEXT_PATTERN));
    await tx.delete(crmContacts).where(like(crmContacts.tags, `%${DEMO_MARKER}%`));
    await tx.delete(members).where(like(members.memberId, `${DEMO_MARKER.toUpperCase()}-%`));
    await tx.delete(categories).where(like(categories.slug, `${DEMO_MARKER}-%`));
    return { success: true };
  });
}

export async function generateDemoData(userId: number) {
  const db = await getDatabase();
  await resetDemoData();
  return db.transaction(async (tx: any) => {
    const contactIds = new Map<string, number>();
    for (const contact of contactsData) {
      await tx.insert(crmContacts).values({ ...contact, userId: null, createdBy: userId, createdAt: daysAgo(90), updatedAt: daysAgo(1) });
      const id = await findContactId(tx, contact.email);
      if (id) contactIds.set(contact.email, id);
    }

    const memberIds = new Map<string, number>();
    for (const member of membersData) {
      await tx.insert(members).values({ ...member, joinedAt: daysAgo(300), createdAt: daysAgo(90), updatedAt: daysAgo(1) });
      const id = await findMemberId(tx, member.memberId);
      if (id) memberIds.set(member.memberId, id);
    }

    const projectIds: number[] = [];
    for (let projectIndex = 0; projectIndex < projectsData.length; projectIndex += 1) {
      const project = projectsData[projectIndex];
      const leaderId = memberIds.get(project.leaderMemberId);
      if (!leaderId) continue;
      await tx.insert(projects).values({ name: project.name, description: project.description, status: project.status, startDate: project.startDate, endDate: project.endDate, budget: project.budget, locationLabel: project.locationLabel, latitude: project.latitude, longitude: project.longitude, leaderId, createdBy: userId, createdAt: daysAgo(70), updatedAt: daysAgo(1) });
      const rows = await tx.select({ id: projects.id }).from(projects).where(eq(projects.name, project.name)).limit(1);
      const projectId = rows[0]?.id as number | undefined;
      if (projectId) {
        projectIds.push(projectId);
        await tx.insert(projectMembers).values({ projectId, memberId: leaderId, role: "project-lead", joinedAt: project.startDate, createdAt: project.startDate });
        for (const memberKey of ["DEMO-2026-001", "DEMO-2026-002", "DEMO-2026-004"]) {
          const memberId = memberIds.get(memberKey);
          if (memberId && memberId !== leaderId) await tx.insert(projectMembers).values({ projectId, memberId, role: "member", joinedAt: project.startDate, createdAt: project.startDate });
        }
        await tx.insert(projectBudgetItems).values([
          { projectId, category: "Matériel et fournitures", amount: projectIndex === 0 ? "9500000" : projectIndex === 1 ? "18000000" : "5400000", spent: projectIndex === 0 ? "6200000" : projectIndex === 1 ? "5800000" : "5400000", description: `${DEMO_LABEL} Ligne budgétaire principale.` },
          { projectId, category: "Transport et terrain", amount: projectIndex === 0 ? "4500000" : projectIndex === 1 ? "6250000" : "2100000", spent: projectIndex === 0 ? "2100000" : projectIndex === 1 ? "3200000" : "2100000", description: `${DEMO_LABEL} Déplacements et logistique.` },
        ]);
        await tx.insert(projectTasks).values([
          { projectId, title: `${DEMO_LABEL} Préparer le prochain point d'équipe`, description: `${DEMO_LABEL} Tâche de coordination liée au projet.`, status: projectIndex === 2 ? "completed" : "in-progress", priority: projectIndex === 0 ? "high" : "medium", assignedTo: leaderId, dueDate: daysAgo(projectIndex === 2 ? 90 : -8), createdAt: daysAgo(18), updatedAt: daysAgo(2) },
          { projectId, title: `${DEMO_LABEL} Consolider les pièces justificatives`, description: `${DEMO_LABEL} Vérifier les reçus, factures et listes de bénéficiaires.`, status: projectIndex === 2 ? "completed" : "todo", priority: "medium", assignedTo: leaderId, dueDate: daysAgo(projectIndex === 2 ? 80 : -15), createdAt: daysAgo(11), updatedAt: daysAgo(1) },
        ]);
        await tx.insert(projectMilestones).values([
          { projectId, title: `${DEMO_LABEL} Cadrage et mobilisation`, description: `${DEMO_LABEL} Première étape validée avec les responsables.`, dueDate: daysAgo(projectIndex === 2 ? 170 : 35), status: "completed", createdAt: daysAgo(60), updatedAt: daysAgo(10) },
          { projectId, title: `${DEMO_LABEL} Bilan intermédiaire`, description: `${DEMO_LABEL} Revue des résultats et ajustement du plan d'action.`, dueDate: daysAgo(projectIndex === 2 ? 130 : -25), status: projectIndex === 2 ? "completed" : "pending", createdAt: daysAgo(25), updatedAt: daysAgo(1) },
        ]);
        await tx.insert(projectUpdates).values({ projectId, title: `${DEMO_LABEL} Point de suivi`, content: `${DEMO_LABEL} Les équipes ont confirmé le calendrier, les besoins et les prochaines responsabilités.`, createdBy: userId, createdAt: daysAgo(4) });
      }
    }

    for (const campaign of campaignsData) {
      await tx.insert(campaigns).values({
        title: campaign.title,
        description: campaign.description,
        objectif: campaign.objectif,
        montantCollecte: campaign.montantCollecte,
        dateDebut: daysAgo(campaign.startDays),
        dateFin: daysAgo(campaign.endDays),
        status: campaign.status,
        createdBy: userId,
        createdAt: daysAgo(60),
        updatedAt: daysAgo(1),
      });
    }

    for (const adhesion of adhesionData) {
      const memberId = memberIds.get(adhesion.memberKey);
      if (!memberId) continue;
      const dateDebut = daysAgo(adhesion.startDays);
      const dateExpiration = daysAgo(adhesion.endDays);
      await tx.insert(adhesions).values({
        memberId,
        annee: 2026,
        montant: adhesion.amount,
        dateAdhesion: dateDebut,
        dateExpiration,
        status: adhesion.status,
        type: adhesion.type,
        dateDebut,
        modePayment: adhesion.payment,
        referencePayment: adhesion.status === "active" ? `DEMO-VIR-${adhesion.memberKey.slice(-3)}` : null,
        datePaiement: adhesion.status === "active" ? dateDebut : null,
        notes: `${DEMO_LABEL} Adhésion de démonstration liée au registre 2026.`,
        createdAt: dateDebut,
        updatedAt: daysAgo(1),
      });
    }

    for (const event of eventsData) {
      const startDate = daysAgo(event.startDays);
      const endDate = new Date(new Date(startDate).getTime() + event.durationHours * 60 * 60 * 1000).toISOString();
      await tx.insert(events).values({
        title: event.title,
        description: event.description,
        location: event.location,
        eventType: event.eventType,
        startDate,
        endDate,
        color: event.eventType === "formation" ? "#d97706" : "#1a4d2e",
        organizer: event.organizer,
        attendees: event.attendees,
        createdBy: userId,
        createdAt: startDate,
        updatedAt: daysAgo(1),
      });
    }

    const assemblyIds = new Map<string, number>();
    for (const assembly of assembliesData) {
      const scheduledAt = daysAgo(assembly.days);
      const opensAt = daysAgo(assembly.days + 1);
      const closesAt = assembly.status === "closed" ? daysAgo(assembly.days - 2) : null;
      const result = await tx.insert(assemblies).values({
        title: assembly.title,
        description: assembly.description,
        type: assembly.type,
        status: assembly.status,
        scheduledAt,
        opensAt,
        closesAt,
        quorumPercentage: assembly.quorum,
        minutes: assembly.status === "closed" ? `${DEMO_LABEL} Procès-verbal validé par le bureau.` : null,
        createdBy: userId,
        createdAt: daysAgo(Math.max(assembly.days, 1) + 15),
        updatedAt: daysAgo(1),
      });
      const assemblyId = Number((result as any)[0].insertId);
      assemblyIds.set(assembly.title, assemblyId);
      for (let memberIndex = 0; memberIndex < 4; memberIndex += 1) {
        const memberKey = `DEMO-2026-00${memberIndex + 1}`;
        const memberId = memberIds.get(memberKey);
        if (!memberId) continue;
        const attendance = assembly.status === "closed" ? (memberIndex === 3 ? "represented" : "present") : assembly.status === "open" && memberIndex === 3 ? "absent" : "invited";
        await tx.insert(assemblyParticipants).values({ assemblyId, memberId, attendance, checkedInAt: attendance === "present" ? scheduledAt : null, createdAt: scheduledAt, updatedAt: daysAgo(1) });
      }
      const resolutionResult = await tx.insert(assemblyResolutions).values([
        { assemblyId, title: `${DEMO_LABEL} Valider le rapport moral et financier`, description: `${DEMO_LABEL} Approbation des résultats de l'exercice et des orientations annuelles.`, orderIndex: 1, status: assembly.status === "closed" ? "closed" : assembly.status === "open" ? "open" : "draft", closedAt: assembly.status === "closed" ? daysAgo(assembly.days - 2) : null, createdAt: scheduledAt, updatedAt: daysAgo(1) },
        { assemblyId, title: `${DEMO_LABEL} Autoriser le budget des actions terrain`, description: `${DEMO_LABEL} Validation de l'enveloppe consacrée aux actions prioritaires.`, orderIndex: 2, status: assembly.status === "closed" ? "closed" : assembly.status === "open" ? "open" : "draft", closedAt: assembly.status === "closed" ? daysAgo(assembly.days - 2) : null, createdAt: scheduledAt, updatedAt: daysAgo(1) },
      ]);
      if (assembly.status === "closed") {
        const firstResolutionId = Number((resolutionResult as any)[0].insertId);
        const secondResolutionId = firstResolutionId + 1;
        for (const memberKey of ["DEMO-2026-001", "DEMO-2026-002", "DEMO-2026-003"]) {
          const memberId = memberIds.get(memberKey);
          if (memberId) {
            await tx.insert(assemblyVotes).values({ resolutionId: firstResolutionId, memberId, choice: memberKey === "DEMO-2026-003" ? "abstain" : "for", createdAt: daysAgo(assembly.days - 1), updatedAt: daysAgo(assembly.days - 1) });
            await tx.insert(assemblyVotes).values({ resolutionId: secondResolutionId, memberId, choice: memberKey === "DEMO-2026-002" ? "against" : "for", createdAt: daysAgo(assembly.days - 1), updatedAt: daysAgo(assembly.days - 1) });
          }
        }
      }
    }
    const openAssemblyId = assemblyIds.get("Réunion extraordinaire — centre de formation");
    const representedMemberId = memberIds.get("DEMO-2026-003");
    const proxyMemberId = memberIds.get("DEMO-2026-001");
    if (openAssemblyId && representedMemberId && proxyMemberId) {
      await tx.insert(assemblyProxies).values({ assemblyId: openAssemblyId, representedMemberId, proxyMemberId, status: "pending", createdAt: daysAgo(3), updatedAt: daysAgo(1) });
    }

    for (const announcement of announcementData) {
      const publishedAt = announcement.status === "draft" ? null : daysAgo(announcement.publishedDays);
      await tx.insert(announcements).values({ title: announcement.title, content: announcement.content, category: announcement.category, authorId: userId, priority: announcement.priority, status: announcement.status, publishedAt, expiresAt: daysAgo(announcement.expiresDays), createdAt: daysAgo(announcement.publishedDays + 3), updatedAt: daysAgo(1) });
    }

    for (const notification of notificationData) {
      await tx.insert(notifications).values({ userId, title: notification.title, message: notification.message, type: notification.type, isRead: notification.isRead, actionUrl: notification.actionUrl, eventKey: notification.eventKey, entityType: notification.entityType, dedupeKey: `${DEMO_MARKER}-${notification.eventKey}`, createdAt: daysAgo(notification.days) });
    }

    const donationIds: number[] = [];
    for (const donation of donationsData) {
      await tx.insert(dons).values({ donateur: donation.donor, montant: donation.amount, currency: "XOF", description: donation.description, email: donation.email, telephone: donation.phone, date: donation.date, createdAt: donation.date });
      const rows = await tx.select({ id: dons.id }).from(dons).where(and(eq(dons.email, donation.email), eq(dons.description, donation.description))).limit(1);
      if (rows[0]?.id) donationIds.push(Number(rows[0].id));
    }

    const expenseIds: number[] = [];
    for (const expense of expensesData) {
      await tx.insert(depenses).values({ description: expense.description, montant: expense.amount, currency: "XOF", categorie: expense.category, date: expense.date, approuvePar: expense.approved ? userId : null, notes: expense.notes, createdAt: expense.date, updatedAt: expense.date });
      const rows = await tx.select({ id: depenses.id }).from(depenses).where(and(eq(depenses.description, expense.description), eq(depenses.montant, expense.amount))).limit(1);
      if (rows[0]?.id) expenseIds.push(Number(rows[0].id));
    }

    for (let index = 0; index < donationsData.length; index += 1) {
      const donation = donationsData[index];
      const contactId = contactIds.get(donation.email);
      await tx.insert(transactions).values({ type: "don", montant: donation.amount, currency: "XOF", description: donation.description, date: donation.date, referenceId: contactId ?? null, createdAt: donation.date });
    }
    for (let index = 0; index < expensesData.length; index += 1) {
      const expense = expensesData[index];
      await tx.insert(transactions).values({ type: "depense", montant: expense.amount, currency: "XOF", description: expense.description, date: expense.date, referenceId: expenseIds[index] ?? null, createdAt: expense.date });
    }

    for (const document of documentsData) {
      const categoryId = await getOrCreateCategory(tx, document.categorySlug, document.categoryName, userId);
      await tx.insert(documents).values({ title: document.title, description: document.description, categoryId, status: document.status, priority: document.priority, createdBy: userId, updatedBy: userId, createdAt: daysAgo(90), updatedAt: daysAgo(1), dueDate: document.dueDate, isArchived: 0 });
    }

    for (const activity of activitiesData) {
      const contactId = contactIds.get(activity.contactEmail);
      if (!contactId) continue;
      const createdAt = daysAgo(activity.days);
      await tx.insert(crmActivities).values({ contactId, type: activity.type, title: activity.title, description: activity.description, status: activity.status, priority: activity.priority, dueDate: createdAt, completedDate: activity.status === "completed" ? createdAt : null, assignedTo: userId, createdBy: userId, createdAt, updatedAt: createdAt });
    }

    return {
      success: true,
      counts: { contacts: contactsData.length, members: membersData.length, donations: donationsData.length, expenses: expensesData.length, transactions: donationsData.length + expensesData.length, documents: documentsData.length, activities: activitiesData.length, projects: projectIds.length, campaigns: campaignsData.length, adhesions: adhesionData.length, events: eventsData.length, tasks: projectIds.length * 2, milestones: projectIds.length * 2, assemblies: assembliesData.length, announcements: announcementData.length, notifications: notificationData.length },
      marker: DEMO_MARKER,
    };
  });
}

export async function getDemoDataSummary() {
  const db = await getDatabase();
  const [contacts, membersRows, donations, expenses, docs, activities, projectsRows, campaignRows, adhesionRows, eventRows, taskRows, milestoneRows, assemblyRows, announcementRows, notificationRows] = await Promise.all([
    db.select({ id: crmContacts.id }).from(crmContacts).where(like(crmContacts.tags, `%${DEMO_MARKER}%`)),
    db.select({ id: members.id }).from(members).where(like(members.memberId, `${DEMO_MARKER.toUpperCase()}-%`)),
    db.select({ id: dons.id }).from(dons).where(like(dons.description, DEMO_TEXT_PATTERN)),
    db.select({ id: depenses.id }).from(depenses).where(like(depenses.description, DEMO_TEXT_PATTERN)),
    db.select({ id: documents.id }).from(documents).where(like(documents.description, DEMO_TEXT_PATTERN)),
    db.select({ id: crmActivities.id }).from(crmActivities).where(like(crmActivities.description, DEMO_TEXT_PATTERN)),
    db.select({ id: projects.id }).from(projects).where(like(projects.description, DEMO_TEXT_PATTERN)),
    db.select({ id: campaigns.id }).from(campaigns).where(like(campaigns.description, DEMO_TEXT_PATTERN)),
    db.select({ id: adhesions.id }).from(adhesions).where(like(adhesions.notes, DEMO_TEXT_PATTERN)),
    db.select({ id: events.id }).from(events).where(like(events.description, DEMO_TEXT_PATTERN)),
    db.select({ id: projectTasks.id }).from(projectTasks).where(like(projectTasks.description, DEMO_TEXT_PATTERN)),
    db.select({ id: projectMilestones.id }).from(projectMilestones).where(like(projectMilestones.description, DEMO_TEXT_PATTERN)),
    db.select({ id: assemblies.id }).from(assemblies).where(like(assemblies.description, DEMO_TEXT_PATTERN)),
    db.select({ id: announcements.id }).from(announcements).where(like(announcements.content, DEMO_TEXT_PATTERN)),
    db.select({ id: notifications.id }).from(notifications).where(like(notifications.message, DEMO_TEXT_PATTERN)),
  ]);
  return { hasData: contacts.length + membersRows.length + donations.length + expenses.length + docs.length + activities.length + projectsRows.length + campaignRows.length + adhesionRows.length + eventRows.length + assemblyRows.length + announcementRows.length + notificationRows.length > 0, counts: { contacts: contacts.length, members: membersRows.length, donations: donations.length, expenses: expenses.length, transactions: donations.length + expenses.length, documents: docs.length, activities: activities.length, projects: projectsRows.length, campaigns: campaignRows.length, adhesions: adhesionRows.length, events: eventRows.length, tasks: taskRows.length, milestones: milestoneRows.length, assemblies: assemblyRows.length, announcements: announcementRows.length, notifications: notificationRows.length } };
}

export { DEMO_MARKER };
