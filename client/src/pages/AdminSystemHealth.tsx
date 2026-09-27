import { useState } from "react";
import { CheckCircle2, Database, Loader2, RefreshCw, Server, ShieldAlert, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSystemHealth() {
  const [lastRefresh, setLastRefresh] = useState(() => new Date());
  const health = trpc.admin.getSystemHealth.useQuery(undefined, { refetchInterval: 60_000 });
  const refresh = async () => { await health.refetch(); setLastRefresh(new Date()); };

  if (health.isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;

  const data = health.data;
  const healthy = data?.overall === "healthy";
  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><Server className="h-3.5 w-3.5" />Administration</div>
          <h1 className="text-3xl font-bold tracking-tight">État du système</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">Surveillez la connexion à la base, les tables critiques et le journal des migrations.</p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={health.isFetching} className="gap-2 self-start sm:self-auto"><RefreshCw className={health.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />Actualiser</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>État global</CardDescription><CardTitle className="flex items-center gap-2 text-2xl">{healthy ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <ShieldAlert className="h-6 w-6 text-amber-600" />}{healthy ? "Opérationnel" : "À vérifier"}</CardTitle></CardHeader><CardContent><Badge variant={healthy ? "default" : "secondary"}>{data?.overall ?? "inconnu"}</Badge></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Base de données</CardDescription><CardTitle className="flex items-center gap-2 text-2xl">{data?.database.connected ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <XCircle className="h-6 w-6 text-destructive" />}{data?.database.connected ? "Connectée" : "Indisponible"}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Vérification réalisée côté serveur</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Migrations connues</CardDescription><CardTitle className="flex items-center gap-2 text-2xl"><Database className="h-6 w-6 text-primary" />{data?.migrations.count ?? 0}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Entrées dans __drizzle_migrations</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Tables critiques</CardTitle><CardDescription>La présence de ces tables est nécessaire aux modules principaux et à la sécurité des accès.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.tables ?? []).map((table) => <div key={table.name} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"><span className="font-mono">{table.name}</span>{table.present ? <Badge className="gap-1 bg-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Présente</Badge> : <Badge variant="destructive" className="gap-1"><XCircle className="h-3.5 w-3.5" />Manquante</Badge>}</div>)}
          </div>
          {!data?.tables.length ? <p className="py-5 text-sm text-muted-foreground">Le diagnostic n’a pas pu retourner la liste des tables.</p> : null}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Dernière actualisation de l’écran : {lastRefresh.toLocaleString("fr-FR")}. Cette page effectue une lecture seule.</p>
    </div>
  );
}
