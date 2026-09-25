import { CalendarDays, CircleHelp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Project = {
  id: number;
  name: string;
  status?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

type TimelineProject = Project & {
  start: Date;
  end: Date;
  progress: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const STATUS_LABELS: Record<string, string> = {
  planning: "Planification",
  "in-progress": "En cours",
  "on-hold": "En pause",
  completed: "Terminé",
  archived: "Archivé",
};

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-blue-500",
  "in-progress": "bg-amber-500",
  "on-hold": "bg-orange-500",
  completed: "bg-emerald-500",
  archived: "bg-slate-400",
};

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function projectProgress(project: Project, start: Date, end: Date) {
  if (project.status === "completed") return 100;
  if (project.status === "planning") return 0;
  if (project.status === "on-hold") return 35;
  const today = startOfDay(new Date());
  const duration = Math.max(end.getTime() - start.getTime(), DAY_MS);
  return Math.round(Math.min(95, Math.max(5, ((today.getTime() - start.getTime()) / duration) * 100)));
}

function buildTimeline(projects: Project[]) {
  const normalized = projects
    .map((project) => {
      const start = project.startDate ? startOfDay(new Date(project.startDate)) : null;
      const end = project.endDate ? startOfDay(new Date(project.endDate)) : null;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
      return { ...project, start, end, progress: projectProgress(project, start, end) };
    })
    .filter((project): project is TimelineProject => project !== null);

  if (normalized.length === 0) return null;
  const minDate = new Date(Math.min(...normalized.map((project) => project.start.getTime())));
  const maxDate = new Date(Math.max(...normalized.map((project) => project.end.getTime())));
  minDate.setDate(1);
  maxDate.setMonth(maxDate.getMonth() + 1, 0);
  return { projects: normalized, minDate, maxDate };
}

function monthTicks(minDate: Date, maxDate: Date) {
  const ticks: Date[] = [];
  const cursor = new Date(minDate);
  cursor.setDate(1);
  while (cursor <= maxDate) {
    ticks.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return ticks;
}

export function ProjectGantt({ projects }: { projects: Project[] }) {
  const timeline = buildTimeline(projects);
  const totalDays = timeline ? Math.max(1, (timeline.maxDate.getTime() - timeline.minDate.getTime()) / DAY_MS) : 0;
  const ticks = timeline ? monthTicks(timeline.minDate, timeline.maxDate) : [];
  const today = startOfDay(new Date());
  const todayPosition = timeline ? ((today.getTime() - timeline.minDate.getTime()) / (timeline.maxDate.getTime() - timeline.minDate.getTime())) * 100 : -1;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Calendrier des projets</CardTitle>
          <CardDescription>Suivez les périodes prévues et l’avancement de chaque projet.</CardDescription>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CircleHelp className="h-4 w-4" /> Progression estimée selon le statut et les dates
        </div>
      </CardHeader>
      <CardContent>
        {!timeline ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ajoutez une date de début et une date de fin à vos projets pour afficher le diagramme de Gantt.
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[220px_minmax(520px,1fr)] border-b pb-2 text-xs font-medium text-muted-foreground">
                <div>Projet</div>
                <div className="relative h-6">
                  {ticks.map((tick) => {
                    const position = ((tick.getTime() - timeline.minDate.getTime()) / (timeline.maxDate.getTime() - timeline.minDate.getTime())) * 100;
                    return <span key={tick.toISOString()} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${position}%` }}>{tick.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}</span>;
                  })}
                </div>
              </div>
              <div className="divide-y">
                {timeline.projects.map((project) => {
                  const left = ((project.start.getTime() - timeline.minDate.getTime()) / (timeline.maxDate.getTime() - timeline.minDate.getTime())) * 100;
                  const width = Math.max(1.5, ((project.end.getTime() - project.start.getTime()) / (timeline.maxDate.getTime() - timeline.minDate.getTime())) * 100);
                  const color = STATUS_COLORS[project.status || "planning"] || STATUS_COLORS.planning;
                  return (
                    <div key={project.id} className="grid grid-cols-[220px_minmax(520px,1fr)] items-center py-3">
                      <div className="pr-4">
                        <p className="truncate text-sm font-medium" title={project.name}>{project.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{STATUS_LABELS[project.status || "planning"] || project.status}</Badge>
                          <span className="text-[11px] text-muted-foreground">{project.progress}%</span>
                        </div>
                      </div>
                      <div className="relative h-10 rounded-md bg-muted/50" style={{ backgroundImage: "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)", backgroundSize: `${100 / Math.max(ticks.length, 1)}% 100%` }}>
                        {todayPosition >= 0 && todayPosition <= 100 && <span className="absolute inset-y-0 z-10 w-px bg-rose-500/80" style={{ left: `${todayPosition}%` }} title="Aujourd’hui" />}
                        <div className={`absolute top-2 h-6 rounded-md ${color} shadow-sm`} style={{ left: `${left}%`, width: `${width}%` }} title={`${project.name} : ${formatDate(project.start)} → ${formatDate(project.end)}`}>
                          <div className="h-full rounded-md bg-white/25" style={{ width: `${project.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs text-muted-foreground">
                {Object.entries(STATUS_LABELS).filter(([status]) => timeline.projects.some((project) => project.status === status)).map(([status, label]) => <span key={status} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />{label}</span>)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Période affichée : {formatDate(timeline.minDate)} – {formatDate(timeline.maxDate)}. La ligne rose indique la date du jour.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
