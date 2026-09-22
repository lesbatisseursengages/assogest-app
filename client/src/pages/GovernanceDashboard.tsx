import { Archive, ArrowRight, BellRing, CalendarDays, CheckCircle2, Clock3, Download, Gavel, ListChecks, Users, Vote } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/LoadingState";
import { createGovernanceAssemblyPdf, exportGovernanceAssemblyPdf } from "@/lib/governanceExport";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifiée",
  open: "Ouverte",
  closed: "Clôturée",
  archived: "Archivée",
};

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  open: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  closed: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  archived: "bg-muted text-muted-foreground",
};

function formatDate(value: string | Date | null) {
  if (!value) return "Date non définie";
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 1) binary += String.fromCharCode(bytes[offset]);
  return btoa(binary);
}

function MetricCard({ label, value, helper, icon: Icon, accent }: { label: string; value: number; helper: string; icon: typeof Gavel; accent: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
        <div className={`rounded-xl p-3 ${accent}`}><Icon className="h-5 w-5" /></div>
      </CardContent>
    </Card>
  );
}

export default function GovernanceDashboard() {
  const dashboardQuery = trpc.governance.dashboard.useQuery();
  const setupReminderSchedule = trpc.governance.setupReminderSchedule.useMutation({
    onSuccess: (result) => toast.success(result.alreadyConfigured ? "Les rappels sont déjà actifs" : "Rappels des assemblées activés", { description: "Une notification sera créée jusqu’à sept jours avant chaque assemblée planifiée." }),
    onError: (error) => toast.error(`Impossible d’activer les rappels : ${error.message}`),
  });
  const archivePdf = trpc.governance.archivePdf.useMutation({
    onSuccess: () => toast.success("Procès-verbal archivé dans Documents", { description: "Le PDF est classé dans Gouvernance et Pilotage." }),
    onError: (error) => toast.error(`Impossible d’archiver le PDF : ${error.message}`),
  });

  if (dashboardQuery.isLoading) return <LoadingState variant="cards" label="Chargement du tableau de bord gouvernance…" />;
  if (dashboardQuery.error) return <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Impossible de charger les indicateurs de gouvernance.</div>;

  const data = dashboardQuery.data;
  if (!data) return null;
  const chartData = data.assemblies.map((assembly) => ({
    name: assembly.title.length > 22 ? `${assembly.title.slice(0, 22)}…` : assembly.title,
    participation: assembly.presentCount,
    votes: assembly.voteCount,
    resolutions: assembly.resolutionCount,
  }));
  const handleExport = async (assembly: (typeof data.assemblies)[number]) => {
    try {
      await exportGovernanceAssemblyPdf(assembly);
      toast.success("Procès-verbal exporté en PDF");
    } catch (error) {
      toast.error(`Impossible de générer le PDF : ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  };
  const handleArchive = async (assembly: (typeof data.assemblies)[number]) => {
    try {
      const bytes = await createGovernanceAssemblyPdf(assembly);
      const safeTitle = assembly.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
      await archivePdf.mutateAsync({ assemblyId: assembly.id, title: `PV — ${assembly.title}`, fileName: `proces-verbal-${safeTitle}.pdf`, fileBase64: bytesToBase64(bytes) });
    } catch (error) {
      toast.error(`Impossible de préparer le PDF : ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-3"><Gavel className="h-7 w-7 text-primary" /><h1 className="text-3xl font-bold tracking-tight">Tableau de bord gouvernance</h1></div>
          <p className="mt-2 max-w-2xl text-muted-foreground">Une vue synthétique des assemblées, de la participation et de l’avancement des votes.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="gap-2" onClick={() => setupReminderSchedule.mutate({ cron: "0 0 9 * * *" })} disabled={setupReminderSchedule.isPending}><BellRing className="h-4 w-4" />{setupReminderSchedule.isPending ? "Activation…" : "Activer les rappels"}</Button>
          <Button asChild className="gap-2"><Link href="/governance">Gérer les assemblées <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assemblées" value={data.totals.assemblies} helper={`${data.totals.open} ouverte(s) · ${data.totals.scheduled} planifiée(s)`} icon={Gavel} accent="bg-primary/10 text-primary" />
        <MetricCard label="Participation" value={data.totals.participants} helper={`${data.totals.quorumReached} quorum(s) atteint(s)`} icon={Users} accent="bg-sky-500/10 text-sky-700 dark:text-sky-300" />
        <MetricCard label="Résolutions" value={data.totals.resolutions} helper={`${data.totals.votes} vote(s) enregistré(s)`} icon={ListChecks} accent="bg-violet-500/10 text-violet-700 dark:text-violet-300" />
        <MetricCard label="Assemblées clôturées" value={data.totals.closed} helper="Décisions archivées et traçables" icon={CheckCircle2} accent="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" />
      </div>

      <Card>
        <CardHeader><CardTitle>Historique de participation et des votes</CardTitle><CardDescription>Comparaison des présences, résolutions et votes par assemblée.</CardDescription></CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={55} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="participation" name="Présents" fill="#1a4d2e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="votes" name="Votes" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolutions" name="Résolutions" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader><CardTitle>Suivi des assemblées</CardTitle><CardDescription>Comparez rapidement le statut, le quorum et les votes de chaque séance.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {data.assemblies.map((assembly) => (
              <div key={assembly.id} className="rounded-xl border p-4 transition-colors hover:bg-muted/30">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{assembly.title}</h3><Badge className={`border-0 ${statusStyles[assembly.status] ?? ""}`}>{statusLabels[assembly.status] ?? assembly.status}</Badge></div><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{formatDate(assembly.scheduledAt)}</p></div>
                  <div className="flex shrink-0 items-start gap-4 text-right text-sm"><div><p className="font-semibold">{assembly.resolutionCount}</p><p className="text-xs text-muted-foreground">résolution(s)</p></div><div><p className="font-semibold">{assembly.voteCount}</p><p className="text-xs text-muted-foreground">vote(s)</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" title="Exporter le procès-verbal en PDF" onClick={() => void handleExport(assembly)}><Download className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title="Archiver le procès-verbal dans Documents" onClick={() => void handleArchive(assembly)} disabled={archivePdf.isPending}><Archive className="h-4 w-4" /></Button></div></div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Quorum · {assembly.presentCount}/{assembly.participantCount} présent(s)</span><span className={assembly.quorum.reached ? "font-medium text-emerald-600" : "font-medium text-amber-600"}>{assembly.quorum.attendancePercentage}% / {assembly.quorum.requiredPercentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${assembly.quorum.reached ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min(100, assembly.quorum.attendancePercentage)}%` }} /></div></div><div className={`flex items-center gap-1 text-xs font-medium ${assembly.quorum.reached ? "text-emerald-600" : "text-amber-600"}`}>{assembly.quorum.reached ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}{assembly.quorum.reached ? "Quorum atteint" : "À compléter"}</div></div>
              </div>
            ))}
            {!data.assemblies.length ? <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Aucune assemblée à afficher.</div> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lecture rapide</CardTitle><CardDescription>Les indicateurs qui appellent une action.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 p-4"><Vote className="mt-0.5 h-5 w-5 text-emerald-600" /><div><p className="font-medium">Votes enregistrés</p><p className="mt-1 text-sm text-muted-foreground">{data.totals.votes} vote(s) sont associés aux résolutions démo ou métier.</p></div></div>
            <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-4"><Users className="mt-0.5 h-5 w-5 text-amber-600" /><div><p className="font-medium">Quorum à surveiller</p><p className="mt-1 text-sm text-muted-foreground">{data.assemblies.filter((assembly) => !assembly.quorum.reached && assembly.status !== "closed").length} assemblée(s) nécessitent encore une mobilisation.</p></div></div>
            <div className="flex items-start gap-3 rounded-xl bg-primary/10 p-4"><Gavel className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-medium">Décisions à préparer</p><p className="mt-1 text-sm text-muted-foreground">{data.assemblies.filter((assembly) => assembly.status === "open" || assembly.status === "scheduled").reduce((total, assembly) => total + assembly.resolutionCount, 0)} résolution(s) sont liées aux séances actives ou planifiées.</p></div></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
