import { useState } from "react";
import { CheckCircle2, Circle, Clock3, Edit3, MessageCircle, MoreHorizontal, Plus, Trash2, UserRound } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/core/components/ui/dropdown-menu";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useLeadInteractions } from "../../hooks/useLeadInteractions";
import { useLeadTasks } from "../../hooks/useLeadTasks";
import type { LeadCampaignViewModel } from "../../adapters/leadDetailAdapter";
import type { InteractionFormValues } from "../../schemas/interactionFormSchema";
import type { TaskFormValues } from "../../schemas/taskFormSchema";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import type { LeadTaskViewModel } from "./leadDetail.types";
import { formatLeadDate, taskAuthorName, taskWasUpdated } from "./leadDetail.formatters";
import { CreateInteractionDialog } from "./CreateInteractionDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { TaskDialog } from "./TaskDialog";

interface CommonProps { activeMember: LeadCampaignViewModel | null; creatorUserId: string }
const QueryError = ({ onRetry }: { onRetry: () => void }) => <div className="py-10 text-center"><p className="text-destructive">No fue posible cargar la información.</p><Button variant="outline" className="mt-3" onClick={onRetry}>Reintentar</Button></div>;
const ActivityHeader = ({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) => <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></div>{action}</div>;

export function LeadInteractionsTab({ activeMember, creatorUserId, canCreate }: CommonProps & { canCreate: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const campaignId = activeMember?.campaignId ?? "";
  const memberId = activeMember?.id ?? "";
  const controller = useLeadInteractions(campaignId, memberId, creatorUserId);
  const mutationError = controller.createMutation.error
    ? getApiErrorMessage(controller.createMutation.error, "No se pudo registrar la gestión. Inténtalo nuevamente.")
    : "";
  const openDialog = () => { controller.createMutation.reset(); setDialogOpen(true); };
  const submit = (data: InteractionFormValues, done: () => void) => controller.createMutation.mutate(data, { onSuccess: done });
  return <Card className="p-5 sm:p-6"><ActivityHeader title="Interacciones" description={activeMember ? `Historial de contactos de ${activeMember.campaignName}.` : "Historial de contactos por campaña."} action={canCreate && memberId ? <Button onClick={openDialog}><Plus className="h-4 w-4" />Nueva interacción</Button> : undefined} />{!activeMember ? <p className="py-10 text-center text-muted-foreground">Primero agrega este prospecto a una campaña para registrar interacciones.</p> : controller.query.isLoading ? <div role="status"><p className="mb-3 text-sm text-muted-foreground">Cargando actividad de la campaña...</p><div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div></div> : controller.query.isError ? <QueryError onRetry={() => void controller.query.refetch()} /> : controller.interactions.length === 0 ? <p className="py-10 text-center text-muted-foreground">No hay interacciones registradas para esta campaña.</p> : <div className="relative space-y-6 before:absolute before:bottom-4 before:left-[18px] before:top-4 before:w-px before:bg-border">{controller.interactions.map((interaction) => <div key={interaction.id} className="relative flex gap-4"><div className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background"><MessageCircle className="h-4 w-4 text-primary" /></div><div className="min-w-0 flex-1 rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">{interaction.typeLabel}</Badge>{interaction.createdAt && <time className="text-sm text-muted-foreground">{formatLeadDate(interaction.createdAt, true)}</time>}</div><p className="mt-3 text-sm leading-6">{interaction.notes || "Sin notas"}</p><p className="mt-2 text-sm text-muted-foreground">Registrado por {interaction.creatorName}</p></div></div>)}</div>}<CreateInteractionDialog open={dialogOpen} onOpenChange={setDialogOpen} isPending={controller.createMutation.isPending} error={mutationError} onSubmit={submit} /></Card>;
}

function TaskCard({
  task,
  canManage,
  onEdit,
  onToggle,
  onDelete,
}: {
  task: LeadTaskViewModel;
  canManage: boolean;
  onEdit: (task: LeadTaskViewModel) => void;
  onToggle: (task: LeadTaskViewModel) => void;
  onDelete: (task: LeadTaskViewModel) => void;
}) {
  const updated = taskWasUpdated(task);

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start gap-3">
        {task.isDone ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        ) : (
          <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={`font-semibold ${task.isDone ? "text-muted-foreground line-through" : ""}`}>
                {task.title || "Tarea sin título"}
              </h3>
              <Badge className="mt-1" variant="outline">
                {task.isDone ? "Completada" : "Pendiente"}
              </Badge>
            </div>
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Acciones de tarea</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onEdit(task)}>
                    <Edit3 className="mr-2 h-4 w-4" />Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onToggle(task)}>
                    {task.isDone ? <Circle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    {task.isDone ? "Marcar pendiente" : "Marcar completada"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => onDelete(task)}>
                    <Trash2 className="mr-2 h-4 w-4" />Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {task.content && <p className="mt-2 text-sm leading-6 text-muted-foreground">{task.content}</p>}
          {task.dueDate && <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground"><Clock3 className="h-4 w-4" />Vence: {formatLeadDate(task.dueDate)}</p>}
          <div className="mt-4 space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
            <p className="flex flex-wrap items-center gap-1.5"><UserRound className="h-3.5 w-3.5 shrink-0" />Creada por {taskAuthorName(task)}</p>
            <p>Creada: {formatLeadDate(task.createdAt, true)}</p>
            {updated && <p>Actualizada: {formatLeadDate(task.updatedAt, true)}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeadTasksTab({ activeMember, creatorUserId, canManage }: CommonProps & { canManage: boolean }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<LeadTaskViewModel | null>(null);
  const [deletingTask, setDeletingTask] = useState<LeadTaskViewModel | null>(null);
  const campaignId = activeMember?.campaignId ?? "";
  const memberId = activeMember?.id ?? "";
  const controller = useLeadTasks(campaignId, memberId, creatorUserId);
  const formMutation = editingTask ? controller.updateMutation : controller.createMutation;
  const formError = formMutation.error
    ? getApiErrorMessage(formMutation.error, editingTask ? "No se pudo actualizar la tarea. Inténtalo nuevamente." : "No se pudo crear la tarea. Inténtalo nuevamente.")
    : "";
  const openCreate = () => { setEditingTask(null); controller.createMutation.reset(); setFormOpen(true); };
  const openEdit = (task: LeadTaskViewModel) => { setEditingTask(task); controller.updateMutation.reset(); setFormOpen(true); };
  const submit = (data: TaskFormValues, done: () => void) => editingTask ? controller.updateFromForm(editingTask, data, done) : controller.createMutation.mutate(data, { onSuccess: done });
  const toggle = (task: LeadTaskViewModel) => controller.updateMutation.mutate({ taskId: task.id, payload: { is_done: !task.isDone } });
  const confirmDelete = (done: () => void) => { if (deletingTask) controller.deleteMutation.mutate(deletingTask.id, { onSuccess: done }); };

  return <Card className="p-5 sm:p-6"><ActivityHeader title="Tareas" description={activeMember ? `Pendientes vinculados a ${activeMember.campaignName}.` : "Pendientes vinculados por campaña."} action={canManage && memberId ? <Button onClick={openCreate}><Plus className="h-4 w-4" />Nueva tarea</Button> : undefined} />{!activeMember ? <p className="py-10 text-center text-muted-foreground">Primero agrega este prospecto a una campaña para crear tareas.</p> : controller.query.isLoading ? <div role="status"><p className="mb-3 text-sm text-muted-foreground">Cargando actividad de la campaña...</p><div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div></div> : controller.query.isError ? <QueryError onRetry={() => void controller.query.refetch()} /> : controller.tasks.length === 0 ? <p className="py-10 text-center text-muted-foreground">No hay tareas registradas para esta campaña.</p> : <div className="grid gap-4 md:grid-cols-2">{controller.tasks.map((task) => <TaskCard key={task.id} task={task} canManage={canManage} onEdit={openEdit} onToggle={toggle} onDelete={setDeletingTask} />)}</div>}<TaskDialog open={formOpen} onOpenChange={setFormOpen} task={editingTask} isPending={formMutation.isPending} error={formError} onSubmit={submit} /><DeleteTaskDialog task={deletingTask} onOpenChange={(open) => { if (!open) setDeletingTask(null); }} isPending={controller.deleteMutation.isPending} onConfirm={confirmDelete} /></Card>;
}
