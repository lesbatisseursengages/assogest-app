import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  FolderOpen,
  Gavel,
  HandHeart,
  History,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Newspaper,
  Settings,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";
import { ModuleSubnav, type ModuleSubnavItem } from "@/components/ModuleSubnav";

type ModuleNavConfig = {
  title: string;
  matches: (location: string) => boolean;
  items: Array<{ id: string; label: string; path: string; icon: typeof Users }>;
};

const modules: ModuleNavConfig[] = [
  {
    title: "Documents",
    matches: (location) => ["/documents", "/categories", "/archives"].includes(location),
    items: [
      { id: "documents", label: "Documents", path: "/documents", icon: FileText },
      { id: "categories", label: "Catégories", path: "/categories", icon: FolderOpen },
      { id: "archives", label: "Archives", path: "/archives", icon: Archive },
    ],
  },
  {
    title: "Membres",
    matches: (location) => ["/members", "/member-directory", "/volunteers", "/members/adhesions", "/adhesions-list", "/member-portal"].includes(location),
    items: [
      { id: "members", label: "Membres", path: "/members", icon: Users },
      { id: "directory", label: "Annuaire", path: "/member-directory", icon: Users },
      { id: "volunteers", label: "Bénévoles", path: "/volunteers", icon: HandHeart },
      { id: "adhesions", label: "Adhésions", path: "/members/adhesions", icon: UserCheck },
      { id: "members-list", label: "Liste des adhérents", path: "/adhesions-list", icon: UserCheck },
      { id: "member-portal", label: "Mon profil", path: "/member-portal", icon: Shield },
    ],
  },
  {
    title: "Projets et événements",
    matches: (location) => location === "/projects" || location.startsWith("/projects/") || ["/events", "/campaigns", "/governance"].includes(location) || location.startsWith("/governance/"),
    items: [
      { id: "projects", label: "Projets", path: "/projects", icon: Briefcase },
      { id: "events", label: "Événements", path: "/events", icon: Calendar },
      { id: "campaigns", label: "Campagnes", path: "/campaigns", icon: Megaphone },
      { id: "governance-dashboard", label: "Tableau de bord", path: "/governance/dashboard", icon: BarChart3 },
      { id: "governance", label: "Gouvernance", path: "/governance", icon: Gavel },
    ],
  },
  {
    title: "Structures",
    matches: (location) => ["/antennes", "/groupes-antennes"].includes(location) || location.startsWith("/antennes/"),
    items: [
      { id: "antennes", label: "Antennes", path: "/antennes", icon: MapPin },
      { id: "groups", label: "Groupes", path: "/groupes-antennes", icon: Users },
    ],
  },
  {
    title: "CRM",
    matches: (location) => ["/crm", "/crm/contacts", "/crm/activities", "/crm/reports"].includes(location),
    items: [
      { id: "crm", label: "Tableau de bord", path: "/crm", icon: BarChart3 },
      { id: "contacts", label: "Contacts", path: "/crm/contacts", icon: Users },
      { id: "activities", label: "Activités", path: "/crm/activities", icon: Activity },
      { id: "reports", label: "Rapports", path: "/crm/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Communication",
    matches: (location) => ["/announcements", "/news", "/email-composer", "/email-templates", "/email-history"].includes(location),
    items: [
      { id: "announcements", label: "Annonces", path: "/announcements", icon: Megaphone },
      { id: "news", label: "Actualités", path: "/news", icon: Newspaper },
      { id: "composer", label: "Composer", path: "/email-composer", icon: Mail },
      { id: "templates", label: "Modèles email", path: "/email-templates", icon: FileText },
      { id: "email-history", label: "Historique email", path: "/email-history", icon: History },
    ],
  },
  {
    title: "Administration",
    matches: (location) => ["/admin-portal", "/global-settings", "/users", "/admin/roles", "/admin/permissions", "/admin/audit-logs", "/admin/password-resets", "/admin/settings"].includes(location),
    items: [
      { id: "admin", label: "Vue d’ensemble", path: "/admin-portal", icon: Landmark },
      { id: "identity", label: "Identité", path: "/global-settings", icon: Settings },
      { id: "users", label: "Utilisateurs", path: "/users", icon: Users },
      { id: "roles", label: "Rôles", path: "/admin/roles", icon: Shield },
      { id: "permissions", label: "Permissions", path: "/admin/permissions", icon: Lock },
      { id: "audit", label: "Audit", path: "/admin/audit-logs", icon: History },
      { id: "resets", label: "Réinitialisations", path: "/admin/password-resets", icon: UserCheck },
      { id: "settings", label: "Paramètres", path: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Activité et suivi",
    matches: (location) => ["/activity", "/audit-history", "/notifications"].includes(location),
    items: [
      { id: "activity", label: "Activité", path: "/activity", icon: Activity },
      { id: "audit-history", label: "Historique", path: "/audit-history", icon: History },
      { id: "notifications", label: "Notifications", path: "/notifications", icon: Bell },
    ],
  },
];

export function ContextualModuleNav() {
  const [location, setLocation] = useLocation();
  const activeModule = modules.find((module) => module.matches(location));
  if (!activeModule) return null;

  const items: ModuleSubnavItem[] = activeModule.items.map((item) => ({
    ...item,
    active: item.path === location || (item.path === "/projects" && location.startsWith("/projects/")) || (item.path === "/antennes" && location.startsWith("/antennes/")),
    onClick: () => setLocation(item.path),
  }));

  return <ModuleSubnav title={activeModule.title} items={items} />;
}
