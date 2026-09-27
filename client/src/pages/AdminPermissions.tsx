import { useMemo, useState } from "react";
import { Eye, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const scopeLabels = { national: "National", antenne: "Antenne", groupe: "Groupe", project: "Projet" } as const;
type ScopeType = keyof typeof scopeLabels;

export default function AdminPermissions() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const { data: roles = [], isLoading: rolesLoading } = trpc.admin.getRoles.useQuery();
  const { data: permissions = [], isLoading: permissionsLoading } = trpc.admin.getPermissions.useQuery();
  const { data: users = [] } = trpc.users.list.useQuery(undefined, { enabled: user?.role === "admin" });
  const { data: antennaResult } = trpc.antennes.list.useQuery({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" }, { enabled: user?.role === "admin" });
  const { data: groupResult } = trpc.groupes.list.useQuery({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" }, { enabled: user?.role === "admin" });
  const { data: projects = [] } = trpc.projects.list.useQuery({ limit: 100, offset: 0 }, { enabled: user?.role === "admin" });
  const [selectedRoleId, setSelectedRoleId] = useState<number>();
  const [scopeUserId, setScopeUserId] = useState("");
  const [scopeType, setScopeType] = useState<ScopeType>("national");
  const [scopeId, setScopeId] = useState("");
  const [accessLevel, setAccessLevel] = useState<"viewer" | "editor" | "manager">("viewer");
  const [previewUserId, setPreviewUserId] = useState("");

  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId) ?? roles[0], [roles, selectedRoleId]);
  const effectiveRoleId = selectedRole?.id;
  const { data: rolePermissions = [], refetch: refetchRolePermissions } = trpc.admin.getRolePermissions.useQuery({ roleId: effectiveRoleId ?? 0 }, { enabled: Boolean(effectiveRoleId) });
  const { data: scopes = [], refetch: refetchScopes } = trpc.admin.listUserScopes.useQuery({});
  const assignPermission = trpc.admin.assignPermissionToRole.useMutation({ onSuccess: () => refetchRolePermissions(), onError: (error) => toast.error(error.message) });
  const removePermission = trpc.admin.removePermissionFromRole.useMutation({ onSuccess: () => refetchRolePermissions(), onError: (error) => toast.error(error.message) });
  const assignScope = trpc.admin.assignUserScope.useMutation({ onSuccess: () => { toast.success("Périmètre attribué"); setScopeUserId(""); setScopeId(""); refetchScopes(); }, onError: (error) => toast.error(error.message) });
  const removeScope = trpc.admin.removeUserScope.useMutation({ onSuccess: () => { toast.success("Périmètre retiré"); refetchScopes(); }, onError: (error) => toast.error(error.message) });
  const startPreview = trpc.preview.start.useMutation({
    onSuccess: async () => { toast.success("Mode aperçu activé en lecture seule"); await utils.auth.me.invalidate(); await utils.preview.status.invalidate(); setLocation("/dashboard"); },
    onError: (error) => toast.error(error.message),
  });

  const assignedPermissionIds = new Set(rolePermissions.map((permission) => permission.id));
  const scopeOptions = scopeType === "antenne" ? (antennaResult?.data ?? []).map((item: any) => ({ id: item.id, label: `${item.name} — ${item.city}` }))
    : scopeType === "groupe" ? (groupResult?.data ?? []).map((item: any) => ({ id: item.id, label: item.name }))
      : scopeType === "project" ? projects.map((item: any) => ({ id: item.id, label: item.name })) : [];
  const userName = (id: number) => { const item = users.find((candidate) => candidate.id === id); return item ? `${item.name || "Utilisateur"} — ${item.email || `#${id}`}` : `Utilisateur #${id}`; };
  const scopeName = (type: ScopeType, id: number | null) => { if (type === "national") return "Tous les périmètres"; return scopeOptionsFor(type).find((item: any) => item.id === id)?.label || `${scopeLabels[type]} #${id}`; };
  const scopeOptionsFor = (type: ScopeType) => type === "antenne" ? (antennaResult?.data ?? []).map((item: any) => ({ id: item.id, label: `${item.name} — ${item.city}` })) : type === "groupe" ? (groupResult?.data ?? []).map((item: any) => ({ id: item.id, label: item.name })) : type === "project" ? projects.map((item: any) => ({ id: item.id, label: item.name })) : [];

  if (!user || user.role !== "admin") return <Card className="mx-auto mt-8 max-w-xl"><CardHeader><CardTitle>Accès refusé</CardTitle></CardHeader><CardContent>Cette page est réservée aux administrateurs.</CardContent></Card>;

  const togglePermission = (permissionId: number) => {
    if (!effectiveRoleId) return;
    const payload = { roleId: effectiveRoleId, permissionId };
    (assignedPermissionIds.has(permissionId) ? removePermission : assignPermission).mutate(payload);
  };
  const handleAssignScope = (event: React.FormEvent) => {
    event.preventDefault();
    const userId = Number(scopeUserId);
    const parsedScopeId = scopeType === "national" ? null : Number(scopeId);
    if (!Number.isInteger(userId) || userId <= 0 || (scopeType !== "national" && (parsedScopeId === null || !Number.isInteger(parsedScopeId) || parsedScopeId <= 0))) { toast.error("Sélectionnez un utilisateur et un périmètre valides."); return; }
    assignScope.mutate({ userId, scopeType, scopeId: parsedScopeId, accessLevel });
  };

  return <div className="space-y-6">
    <header><div className="flex items-center gap-3"><ShieldCheck className="h-7 w-7 text-primary" /><h1 className="text-3xl font-bold tracking-tight">Permissions & accès</h1></div><p className="mt-2 text-muted-foreground">Configurez les droits par rôle, les périmètres d’accès et testez une vue non administrateur.</p></header>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" />Voir en tant que</CardTitle><CardDescription>Prévisualisez l’application avec les droits d’un utilisateur non administrateur. Le mode aperçu est signé, temporaire et entièrement en lecture seule.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="min-w-0 flex-1 space-y-2"><Label htmlFor="preview-user">Utilisateur à prévisualiser</Label><select id="preview-user" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={previewUserId} onChange={(event) => setPreviewUserId(event.target.value)}><option value="">Choisir un utilisateur non administrateur…</option>{users.filter((candidate) => candidate.role !== "admin").map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name || "Utilisateur"} — {candidate.email || `#${candidate.id}`}</option>)}</select></div><Button type="button" className="gap-2" disabled={!previewUserId || startPreview.isPending} onClick={() => startPreview.mutate({ userId: Number(previewUserId) })}><Eye className="h-4 w-4" />{startPreview.isPending ? "Activation…" : "Lancer l’aperçu"}</Button></CardContent></Card>

    <div className="grid gap-6 lg:grid-cols-[280px_1fr]"><Card><CardHeader><CardTitle>Rôles</CardTitle><CardDescription>Sélectionnez un rôle à configurer.</CardDescription></CardHeader><CardContent className="space-y-2">{rolesLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : roles.map((role) => <Button key={role.id} type="button" variant={role.id === effectiveRoleId ? "default" : "outline"} className="w-full justify-start" onClick={() => setSelectedRoleId(role.id)}>{role.name}</Button>)}</CardContent></Card><Card><CardHeader><CardTitle>Matrice des permissions{selectedRole ? ` — ${selectedRole.name}` : ""}</CardTitle><CardDescription>Cliquez sur une permission pour l’activer ou la retirer.</CardDescription></CardHeader><CardContent>{permissionsLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : <div className="grid gap-3 sm:grid-cols-2">{permissions.map((permission) => { const assigned = assignedPermissionIds.has(permission.id); return <button key={permission.id} type="button" disabled={!effectiveRoleId || assignPermission.isPending || removePermission.isPending} onClick={() => togglePermission(permission.id)} className={`rounded-lg border p-3 text-left transition-colors ${assigned ? "border-primary bg-primary/10" : "hover:bg-muted"}`}><div className="flex items-center justify-between gap-2"><span className="font-medium">{permission.name}</span><span className="text-xs text-muted-foreground">{assigned ? "Activée" : "Inactive"}</span></div><p className="mt-1 text-xs text-muted-foreground">{permission.description || permission.category}</p></button>; })}</div>}</CardContent></Card></div>

    <Card><CardHeader><CardTitle>Périmètres utilisateurs</CardTitle><CardDescription>Associez un utilisateur à un périmètre national, une antenne, un groupe ou un projet avec un niveau de lecture, modification ou gestion.</CardDescription></CardHeader><CardContent className="space-y-5"><form onSubmit={handleAssignScope} className="grid gap-3 md:grid-cols-5 md:items-end"><div className="space-y-2"><Label htmlFor="scope-user">Utilisateur</Label><select id="scope-user" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={scopeUserId} onChange={(event) => setScopeUserId(event.target.value)} required><option value="">Choisir…</option>{users.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name || "Utilisateur"} — {candidate.email || `#${candidate.id}`}</option>)}</select></div><div className="space-y-2"><Label htmlFor="scope-type">Type</Label><select id="scope-type" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={scopeType} onChange={(event) => { setScopeType(event.target.value as ScopeType); setScopeId(""); }}>{Object.entries(scopeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="scope-id">Périmètre</Label><select id="scope-id" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={scopeId} onChange={(event) => setScopeId(event.target.value)} disabled={scopeType === "national"} required={scopeType !== "national"}><option value="">{scopeType === "national" ? "Tous les périmètres" : "Choisir…"}</option>{scopeOptions.map((option: any) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="scope-level">Niveau</Label><select id="scope-level" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={accessLevel} onChange={(event) => setAccessLevel(event.target.value as typeof accessLevel)}><option value="viewer">Lecture</option><option value="editor">Modification</option><option value="manager">Gestion</option></select></div><Button type="submit" disabled={assignScope.isPending} className="gap-2"><Plus className="h-4 w-4" />Attribuer</Button></form><div className="overflow-x-auto rounded-lg border"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Utilisateur</th><th className="p-3 text-left">Périmètre</th><th className="p-3 text-left">Niveau</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{scopes.map((scope) => <tr key={scope.id} className="border-t"><td className="p-3">{userName(scope.userId)}</td><td className="p-3">{scopeName(scope.scopeType, scope.scopeId)}</td><td className="p-3 capitalize">{scope.accessLevel}</td><td className="p-3 text-right"><Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => removeScope.mutate({ id: scope.id })}><Trash2 className="h-4 w-4" /></Button></td></tr>)}</tbody></table>{scopes.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Aucun périmètre attribué.</p> : null}</div></CardContent></Card>
  </div>;
}
