import { useState } from "react";
import { FileUp, ShieldCheck, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Entity = "members" | "contacts" | "donations" | "projects";
const labels: Record<Entity, string> = { members: "Membres", contacts: "Contacts CRM", donations: "Dons", projects: "Projets" };
const examples: Record<Entity, string> = {
  members: "firstName,lastName,email,phone,status,memberID",
  contacts: "firstName,lastName,email,phone,company,status",
  donations: "donateur,montant,currency,email,date",
  projects: "name,description,status,startDate,endDate,budget,leaderId",
};

export function CsvImportDialog() {
  const [open, setOpen] = useState(false);
  const [entity, setEntity] = useState<Entity>("members");
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState("");
  const [replaceDemo, setReplaceDemo] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const preview = trpc.dataImport.preview.useMutation();
  const importData = trpc.dataImport.import.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.imported} ligne(s) importée(s)${result.skipped.length ? `, ${result.skipped.length} doublon(s) ignoré(s)` : ""}`);
      setOpen(false); setCsv(""); setFileName(""); setReplaceDemo(false); setConfirmation(""); preview.reset();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) { toast.error("Sélectionnez un fichier CSV."); return; }
    if (file.size > 2_000_000) { toast.error("Le fichier ne doit pas dépasser 2 Mo."); return; }
    setFileName(file.name); setCsv(await file.text()); preview.reset();
  };
  const runPreview = () => { if (!csv.trim()) return toast.error("Sélectionnez d’abord un fichier CSV."); preview.mutate({ entity, csv }); };
  const runImport = () => {
    if (!preview.data || preview.data.issues.length || preview.data.validRows === 0) return toast.error("Corrigez le fichier avant de l’importer.");
    if (replaceDemo && confirmation !== "REMPLACER") return toast.error("Saisissez REMPLACER pour confirmer.");
    importData.mutate({ entity, csv, replaceDemoData: replaceDemo, ...(replaceDemo ? { confirmation: "REMPLACER" as const } : {}) });
  };
  const downloadTemplate = () => {
    const blob = new Blob([`${examples[entity]}\n`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `modele-${entity}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" className="gap-2"><FileUp className="h-4 w-4" />Importer un CSV</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]"><DialogHeader><DialogTitle>Importer des données réelles</DialogTitle><DialogDescription>Le fichier est vérifié côté serveur avant toute écriture. Les doublons sont ignorés.</DialogDescription></DialogHeader><div className="space-y-5 py-2"><div className="grid gap-2"><Label htmlFor="csv-entity">Type de données</Label><select id="csv-entity" value={entity} onChange={(event) => { setEntity(event.target.value as Entity); preview.reset(); }} className="h-10 rounded-md border bg-background px-3 text-sm">{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="flex items-center justify-between rounded-lg border border-dashed p-4"><div><p className="font-medium">{fileName || "Choisir un fichier CSV"}</p><p className="text-xs text-muted-foreground">UTF-8, 2 Mo maximum, 1 000 lignes maximum</p></div><div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={downloadTemplate}><Download className="mr-2 h-4 w-4" />Modèle</Button><Label htmlFor="csv-import-file" className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">Parcourir<input id="csv-import-file" type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])} /></Label></div></div>{csv && <div className="rounded-lg bg-muted/50 p-3 text-xs"><p className="font-medium">Colonnes attendues</p><p className="mt-1 text-muted-foreground">{examples[entity]}</p><Button type="button" size="sm" variant="secondary" className="mt-3" onClick={runPreview} disabled={preview.isPending}>Vérifier le fichier</Button></div>}{preview.data && <div className="space-y-2 rounded-lg border p-3 text-sm"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><strong>{preview.data.validRows} ligne(s) valide(s)</strong><Badge variant="outline">{preview.data.totalRows} au total</Badge></div>{preview.data.issues.length > 0 && <div className="space-y-1 text-destructive"><p className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" />Corrigez ces erreurs :</p>{preview.data.issues.slice(0, 5).map((issue) => <p key={`${issue.row}-${issue.message}`} className="text-xs">Ligne {issue.row} — {issue.message}</p>)}</div>}{preview.data.issues.length === 0 && <p className="text-xs text-muted-foreground">Aperçu validé. Aucune donnée n’est écrite avant votre confirmation.</p>}</div>}<div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3"><div className="flex items-start gap-3"><Checkbox id="replace-demo" checked={replaceDemo} onCheckedChange={(checked) => setReplaceDemo(checked === true)} /><div><Label htmlFor="replace-demo" className="font-medium">Remplacer les données de démonstration</Label><p className="mt-1 text-xs text-muted-foreground">Supprime uniquement les enregistrements marqués démo, puis importe ce fichier. Cette action est réservée aux administrateurs.</p></div></div>{replaceDemo && <div className="mt-3 space-y-2"><Label htmlFor="replace-confirm">Saisissez REMPLACER pour confirmer</Label><Input id="replace-confirm" value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} placeholder="REMPLACER" /></div>}</div><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" />Validation serveur, limite de taille et contrôle des droits administrateur.</div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button type="button" onClick={runImport} disabled={!preview.data || preview.data.issues.length > 0 || importData.isPending}>{importData.isPending ? "Import…" : "Importer les données"}</Button></DialogFooter></DialogContent></Dialog>;
}
