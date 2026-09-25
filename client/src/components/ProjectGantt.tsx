import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CircleHelp, GripHorizontal, Plus, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Project = {
  id: number;
  name: string;
  status?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

type Task = {
  id: number;
  projectId: number;
  title: string;
  status?: string;
  priority?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  dueDate?: string | Date | null;
};

type TimelineProject = Project & { start: Date; end: Date; progress: number };
type TimelineTask = Task & { start: Date; end: Date };
type DraftRange = { start: Date; end: Date };
type DragKind = "move" | "resize-start" | "resize-end";
type DragState = { key: string; kind: DragKind; start: Date; end: Date; initialX: number };

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
const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "À faire",
  "in-progress": "En cours",
  "in-review": "À vérifier",
  completed: "Terminée",
};
const TASK_COLORS: Record<string, string> = {
  todo: "bg-sky-500",
  "in-progress": "bg-violet-500",
  "in-review": "bg-fuchsia-500",
  completed: "bg-emerald-500",
};

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function parseDate(value?: string | Date | null) {
  if (!value) return null;
  const date = startOfDay(new Date(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return startOfDay(result);
}

function projectProgress(project: Project, start: Date, end: Date) {
  if (project.status === "completed") return 100;
  if (project.status === "planning") return 0;
  if (project.status === "on-hold") return 35;
  const today = startOfDay(new Date());
  const duration = Math.max(end.getTime() - start.getTime(), DAY_MS);
  return Math.round(Math.min(95, Math.max(5, ((today.getTime() - start.getTime()) / duration) * 100)));
}

function buildTimeline(projects: Project[], tasks: Task[]) {
  const normalizedProjects = projects
    .map((project) => {
      const start = parseDate(project.startDate);
      const end = parseDate(project.endDate);
      if (!start || !end || end < start) return null;
      return { ...project, start, end, progress: projectProgress(project, start, end) };
    })
    .filter((project): project is TimelineProject => project !== null);

  if (normalizedProjects.length === 0) return null;
  const projectById = new Map(normalizedProjects.map((project) => [project.id, project]));
  const normalizedTasks = tasks
    .map((task) => {
      const project = projectById.get(task.projectId);
      if (!project) return null;
      const start = parseDate(task.startDate) || project.start;
      const end = parseDate(task.endDate) || parseDate(task.dueDate) || addDays(start, 7);
      return { ...task, start, end: end < start ? addDays(start, 1) : end };
    })
    .filter((task): task is TimelineTask => task !== null);

  const allDates = [...normalizedProjects.flatMap((project) => [project.start, project.end]), ...normalizedTasks.flatMap((task) => [task.start, task.end])];
  const minDate = new Date(Math.min(...allDates.map((date) => date.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((date) => date.getTime())));
  minDate.setDate(1);
  maxDate.setMonth(maxDate.getMonth() + 1, 0);
  return { projects: normalizedProjects, tasks: normalizedTasks, minDate, maxDate };
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

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ProjectGantt({ projects, onRefresh }: { projects: Project[]; onRefresh?: () => void }) {
  const utils = trpc.useUtils();
  const projectIds = useMemo(() => projects.map((project) => project.id), [projects]);
  const { data: tasks = [], isLoading: tasksLoading } = trpc.projects.getTasksForGantt.useQuery(
    { projectIds },
    { enabled: projectIds.length > 0 },
  );
  const updateProjectTimeline = trpc.projects.updateTimeline.useMutation();
  const updateTaskTimeline = trpc.projects.updateTaskTimeline.useMutation();
  const createTask = trpc.projects.createTask.useMutation({
    onSuccess: async () => {
      await utils.projects.getTasksForGantt.invalidate();
      setIsTaskDialogOpen(false);
      toast.success("Tâche ajoutée au diagramme");
    },
    onError: (error) => toast.error(error.message),
  });
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskProject, setTaskProject] = useState<TimelineProject | null>(null);
  const [taskForm, setTaskForm] = useState({ title: "", status: "todo", priority: "medium", startDate: "", endDate: "" });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [draftRanges, setDraftRanges] = useState<Record<string, DraftRange>>({});
  const draftRangesRef = useRef<Record<string, DraftRange>>({});
  const timelineRef = useRef<HTMLDivElement>(null);
  const timeline = useMemo(() => buildTimeline(projects, tasks as Task[]), [projects, tasks]);
  const ticks = timeline ? monthTicks(timeline.minDate, timeline.maxDate) : [];
  const totalDays = timeline ? Math.max(1, (timeline.maxDate.getTime() - timeline.minDate.getTime()) / DAY_MS) : 1;
  const today = startOfDay(new Date());
  const todayPosition = timeline ? ((today.getTime() - timeline.minDate.getTime()) / (timeline.maxDate.getTime() - timeline.minDate.getTime())) * 100 : -1;

  const rangeFor = (key: string, start: Date, end: Date) => draftRanges[key] || { start, end };

  const beginDrag = (key: string, kind: DragKind, start: Date, end: Date, event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragState({ key, kind, start, end, initialX: event.clientX });
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    if (!dragState || !timeline) return;
    const handlePointerMove = (event: PointerEvent) => {
      const width = timelineRef.current?.getBoundingClientRect().width || 1;
      const deltaDays = Math.round(((event.clientX - dragState.initialX) / width) * totalDays);
      let start = dragState.start;
      let end = dragState.end;
      if (dragState.kind === "move") {
        start = addDays(dragState.start, deltaDays);
        end = addDays(dragState.end, deltaDays);
      } else if (dragState.kind === "resize-start") {
        start = addDays(dragState.start, deltaDays);
        if (start >= end) start = addDays(end, -1);
      } else {
        end = addDays(dragState.end, deltaDays);
        if (end <= start) end = addDays(start, 1);
      }
      const next = { start, end };
      draftRangesRef.current = { ...draftRangesRef.current, [dragState.key]: next };
      setDraftRanges(draftRangesRef.current);
    };
    const handlePointerUp = () => {
      const range = draftRangesRef.current[dragState.key];
      setDragState(null);
      document.body.style.userSelect = "";
      if (!range) return;
      const [type, idValue] = dragState.key.split(":");
      const id = Number(idValue);
      const mutation = type === "project" ? updateProjectTimeline : updateTaskTimeline;
      mutation.mutate(
        { id, startDate: range.start, endDate: range.end },
        {
          onSuccess: () => {
            setDraftRanges((current) => {
              const next = { ...current };
              delete next[dragState.key];
              draftRangesRef.current = next;
              return next;
            });
            void utils.projects.list.invalidate();
            void utils.projects.getTasksForGantt.invalidate();
            onRefresh?.();
            toast.success("Dates mises à jour");
          },
          onError: (error) => {
            setDraftRanges((current) => {
              const next = { ...current };
              delete next[dragState.key];
              draftRangesRef.current = next;
              return next;
            });
            toast.error(`Impossible d’enregistrer les dates : ${error.message}`);
          },
        },
      );
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.userSelect = "";
    };
  }, [dragState, timeline, totalDays, onRefresh, updateProjectTimeline, updateTaskTimeline]);

  const openTaskDialog = (project: TimelineProject) => {
    setTaskProject(project);
    setTaskForm({ title: "", status: "todo", priority: "medium", startDate: dateInputValue(project.start), endDate: dateInputValue(project.end) });
    setIsTaskDialogOpen(true);
  };

  const handleCreateTask = () => {
    if (!taskProject || !taskForm.title.trim() || !taskForm.startDate || !taskForm.endDate) {
      toast.error("Renseignez le titre et les deux dates de la tâche");
      return;
    }
    const startDate = new Date(`${taskForm.startDate}T00:00:00`);
    const endDate = new Date(`${taskForm.endDate}T00:00:00`);
    if (endDate < startDate) {
      toast.error("La fin de la tâche doit être postérieure à son début");
      return;
    }
    createTask.mutate({
      projectId: taskProject.id,
      title: taskForm.title.trim(),
      status: taskForm.status as "todo" | "in-progress" | "in-review" | "completed",
      priority: taskForm.priority as "low" | "medium" | "high" | "critical",
      startDate,
      endDate,
      dueDate: endDate,
    });
  };

  const position = (date: Date) => timeline ? ((date.getTime() - timeline.minDate.getTime()) / (timeline.maxDate.getTime() - timeline.minDate.getTime())) * 100 : 0;
  const width = (start: Date, end: Date) => timeline ? Math.max(1.5, ((end.getTime() - start.getTime()) / (timeline.maxDate.getTime() - timeline.minDate.getTime())) * 100) : 1.5;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Calendrier des projets</CardTitle>
            <CardDescription>Ajoutez des tâches et déplacez les barres pour ajuster les périodes.</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><CircleHelp className="h-4 w-4" /> Glisser le centre pour déplacer, les poignées pour redimensionner</div>
        </CardHeader>
        <CardContent>
          {!timeline ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Ajoutez une date de début et une date de fin à vos projets pour afficher le diagramme de Gantt.</div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[290px_minmax(560px,1fr)] border-b pb-2 text-xs font-medium text-muted-foreground">
                  <div>Projet et tâches</div>
                  <div className="relative h-6">
                    {ticks.map((tick) => <span key={tick.toISOString()} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${position(tick)}%` }}>{tick.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}</span>)}
                  </div>
                </div>
                <div ref={timelineRef} className="divide-y">
                  {timeline.projects.map((project) => {
                    const projectKey = `project:${project.id}`;
                    const projectRange = rangeFor(projectKey, project.start, project.end);
                    const projectTasks = timeline.tasks.filter((task) => task.projectId === project.id);
                    const color = STATUS_COLORS[project.status || "planning"] || STATUS_COLORS.planning;
                    return (
                      <div key={project.id}>
                        <div className="grid grid-cols-[290px_minmax(560px,1fr)] items-center py-3">
                          <div className="flex min-w-0 items-center gap-2 pr-4">
                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold" title={project.name}>{project.name}</p><div className="mt-1 flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{STATUS_LABELS[project.status || "planning"] || project.status}</Badge><span className="text-[11px] text-muted-foreground">{project.progress}%</span></div></div>
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => openTaskDialog(project)} title="Ajouter une tâche"><Plus className="h-4 w-4" /></Button>
                          </div>
                          <div className="relative h-10 rounded-md bg-muted/50" style={{ backgroundImage: "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)", backgroundSize: `${100 / Math.max(ticks.length, 1)}% 100%` }}>
                            {todayPosition >= 0 && todayPosition <= 100 && <span className="absolute inset-y-0 z-10 w-px bg-rose-500/80" style={{ left: `${todayPosition}%` }} title="Aujourd’hui" />}
                            <div className={`absolute top-2 h-6 rounded-md ${color} shadow-sm`} style={{ left: `${position(projectRange.start)}%`, width: `${width(projectRange.start, projectRange.end)}%` }} title={`${project.name} : ${formatDate(projectRange.start)} → ${formatDate(projectRange.end)}`}>
                              <button type="button" aria-label={`Déplacer ${project.name}`} className="absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing" onPointerDown={(event) => beginDrag(projectKey, "move", projectRange.start, projectRange.end, event)} />
                              <button type="button" aria-label={`Modifier le début de ${project.name}`} className="absolute inset-y-0 left-0 z-20 w-3 cursor-ew-resize" onPointerDown={(event) => beginDrag(projectKey, "resize-start", projectRange.start, projectRange.end, event)} />
                              <button type="button" aria-label={`Modifier la fin de ${project.name}`} className="absolute inset-y-0 right-0 z-20 w-3 cursor-ew-resize" onPointerDown={(event) => beginDrag(projectKey, "resize-end", projectRange.start, projectRange.end, event)} />
                              <div className="pointer-events-none h-full rounded-md bg-white/25" style={{ width: `${project.progress}%` }} />
                            </div>
                          </div>
                        </div>
                        {projectTasks.map((task) => {
                          const taskKey = `task:${task.id}`;
                          const taskRange = rangeFor(taskKey, task.start, task.end);
                          const taskColor = TASK_COLORS[task.status || "todo"] || TASK_COLORS.todo;
                          return <div key={task.id} className="grid grid-cols-[290px_minmax(560px,1fr)] items-center bg-muted/20 py-2"><div className="flex min-w-0 items-center gap-2 pl-7 pr-4"><GripHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><div className="min-w-0"><p className="truncate text-xs font-medium" title={task.title}>{task.title}</p><p className="text-[10px] text-muted-foreground">{TASK_STATUS_LABELS[task.status || "todo"] || task.status} · {formatDate(taskRange.start)} → {formatDate(taskRange.end)}</p></div></div><div className="relative h-7 rounded-md bg-muted/50" style={{ backgroundImage: "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)", backgroundSize: `${100 / Math.max(ticks.length, 1)}% 100%` }}><div className={`absolute top-1.5 h-4 rounded ${taskColor} shadow-sm`} style={{ left: `${position(taskRange.start)}%`, width: `${width(taskRange.start, taskRange.end)}%` }} title={`${task.title} : ${formatDate(taskRange.start)} → ${formatDate(taskRange.end)}`}><button type="button" aria-label={`Déplacer la tâche ${task.title}`} className="absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing" onPointerDown={(event) => beginDrag(taskKey, "move", taskRange.start, taskRange.end, event)} /><button type="button" aria-label={`Modifier le début de la tâche ${task.title}`} className="absolute inset-y-0 left-0 z-20 w-3 cursor-ew-resize" onPointerDown={(event) => beginDrag(taskKey, "resize-start", taskRange.start, taskRange.end, event)} /><button type="button" aria-label={`Modifier la fin de la tâche ${task.title}`} className="absolute inset-y-0 right-0 z-20 w-3 cursor-ew-resize" onPointerDown={(event) => beginDrag(taskKey, "resize-end", taskRange.start, taskRange.end, event)} /></div></div></div>;
                        })}
                        {projectTasks.length === 0 && <div className="grid grid-cols-[290px_minmax(560px,1fr)] py-2"><div className="pl-12 text-[11px] italic text-muted-foreground">Aucune tâche — cliquez sur + pour détailler</div><div /></div>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs text-muted-foreground"><span className="font-medium">Projets :</span>{Object.entries(STATUS_LABELS).filter(([status]) => timeline.projects.some((project) => project.status === status)).map(([status, label]) => <span key={status} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />{label}</span>)}<span className="ml-2 font-medium">Tâches :</span>{Object.entries(TASK_STATUS_LABELS).map(([status, label]) => <span key={status} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${TASK_COLORS[status]}`} />{label}</span>)}</div>
                <p className="mt-2 text-xs text-muted-foreground">Période affichée : {formatDate(timeline.minDate)} – {formatDate(timeline.maxDate)}. La ligne rose indique la date du jour.{tasksLoading ? " Chargement des tâches…" : ""}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Ajouter une tâche</DialogTitle><DialogDescription>{taskProject ? `Détailler le projet « ${taskProject.name} » dans le Gantt.` : "Créer une tâche projet."}</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label htmlFor="gantt-task-title">Titre de la tâche</Label><Input id="gantt-task-title" value={taskForm.title} onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })} placeholder="Ex. Distribuer les kits alimentaires" /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Statut</Label><Select value={taskForm.status} onValueChange={(status) => setTaskForm({ ...taskForm, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todo">À faire</SelectItem><SelectItem value="in-progress">En cours</SelectItem><SelectItem value="in-review">À vérifier</SelectItem><SelectItem value="completed">Terminée</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Priorité</Label><Select value={taskForm.priority} onValueChange={(priority) => setTaskForm({ ...taskForm, priority })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Basse</SelectItem><SelectItem value="medium">Moyenne</SelectItem><SelectItem value="high">Haute</SelectItem><SelectItem value="critical">Critique</SelectItem></SelectContent></Select></div></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="gantt-task-start">Début</Label><Input id="gantt-task-start" type="date" value={taskForm.startDate} onChange={(event) => setTaskForm({ ...taskForm, startDate: event.target.value })} /></div><div className="space-y-2"><Label htmlFor="gantt-task-end">Fin</Label><Input id="gantt-task-end" type="date" min={taskForm.startDate || undefined} value={taskForm.endDate} onChange={(event) => setTaskForm({ ...taskForm, endDate: event.target.value })} /></div></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Annuler</Button><Button type="button" onClick={handleCreateTask} disabled={createTask.isPending}><Save className="mr-2 h-4 w-4" />{createTask.isPending ? "Ajout…" : "Ajouter la tâche"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
