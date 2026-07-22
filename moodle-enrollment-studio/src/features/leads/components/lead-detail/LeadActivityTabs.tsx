import { useState } from "react";
import { CheckCircle2, Circle, Clock3, Edit3, MessageCircle, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/core/components/ui/dropdown-menu";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useLeadInteractions } from "../../hooks/useLeadInteractions";
import { useLeadTasks } from "../../hooks/useLeadTasks";
import type { InteractionFormData, TaskFormData } from "../../schemas/leadDetailActionSchemas";
import type { LeadCampaignMember, LeadTask } from "./leadDetail.types";
import { displayEnum, formatLeadDate, personFullName } from "./leadDetail.formatters";
import { CampaignContextSelector } from "./CampaignContextSelector";
import { CreateInteractionDialog } from "./CreateInteractionDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { TaskDialog } from "./TaskDialog";

interface CommonProps { members: LeadCampaignMember[]; selectedMemberId: string; campaignId: string; sellerId: string; onChange: (memberId: string) => void }
const QueryError = ({ onRetry }: { onRetry: () => void }) => <div className="py-10 text-center"><p className="text-destructive">No fue posible cargar la información.</p><Button variant="outline" className="mt-3" onClick={onRetry}>Reintentar</Button></div>;
const ActivityHeader = ({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) => <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></div>{action}</div>;

export function LeadInteractionsTab({ members, selectedMemberId, campaignId, sellerId, onChange, canCreate }: CommonProps & { canCreate: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const controller = useLeadInteractions(campaignId, selectedMemberId, sellerId);
  const mutationError = controller.createMutation.error instanceof Error ? controller.createMutation.error.message : "";
  const openDialog = () => { controller.createMutation.reset(); setDialogOpen(true); };
  const submit = (data: InteractionFormData, done: () => void) => controller.createMutation.mutate(data, { onSuccess: done });
  return <Card className="p-5 sm:p-6"><ActivityHeader title="Interacciones" description="Historial de contactos de la campaña seleccionada." action={canCreate && selectedMemberId ? <Button onClick={openDialog}><Plus className="h-4 w-4" />Nueva interacción</Button> : undefined} /><CampaignContextSelector members={members} selectedMemberId={selectedMemberId} onChange={onChange} />{members.length === 0 ? <p className="py-10 text-center text-muted-foreground">Primero agrega este prospecto a una campaña para registrar interacciones.</p> : controller.query.isLoading ? <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div> : controller.query.isError ? <QueryError onRetry={() => void controller.query.refetch()} /> : controller.interactions.length === 0 ? <p className="py-10 text-center text-muted-foreground">No hay interacciones registradas para esta campaña.</p> : <div className="relative space-y-6 before:absolute before:bottom-4 before:left-[18px] before:top-4 before:w-px before:bg-border">{controller.interactions.map((interaction, index) => { const author = personFullName(interaction.seller?.user) || interaction.created_by || "No especificado"; return <div key={interaction.id ?? index} className="relative flex gap-4"><div className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background"><MessageCircle className="h-4 w-4 text-primary" /></div><div className="min-w-0 flex-1 rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><Badge variant="outline">{displayEnum(interaction.type)}</Badge>{interaction.created_at && <time className="text-sm text-muted-foreground">{formatLeadDate(interaction.created_at, true)}</time>}</div><p className="mt-3 text-sm leading-6">{interaction.notes || "Sin notas"}</p><p className="mt-2 text-sm text-muted-foreground">Por: {author}</p></div></div>; })}</div>}<CreateInteractionDialog open={dialogOpen} onOpenChange={setDialogOpen} isPending={controller.createMutation.isPending} error={mutationError} onSubmit={submit} /></Card>;
}

export function LeadTasksTab({ members, selectedMemberId, campaignId, sellerId, onChange, canManage }: CommonProps & { canManage: boolean }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<LeadTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<LeadTask | null>(null);
  const controller = useLeadTasks(campaignId, selectedMemberId, sellerId);
  const formMutation = editingTask ? controller.updateMutation : controller.createMutation;
  const formError = formMutation.error instanceof Error ? formMutation.error.message : "";
  const openCreate = () => { setEditingTask(null); controller.createMutation.reset(); setFormOpen(true); };
  const openEdit = (task: LeadTask) => { setEditingTask(task); controller.updateMutation.reset(); setFormOpen(true); };
  const submit = (data: TaskFormData, done: () => void) => editingTask ? controller.updateFromForm(editingTask, data, done) : controller.createMutation.mutate(data, { onSuccess: done });
  const toggle = (task: LeadTask) => { if (task.id) controller.updateMutation.mutate({ taskId: task.id, payload: { is_done: !task.is_done } }); };
  const confirmDelete = (done: () => void) => { if (deletingTask?.id) controller.deleteMutation.mutate(deletingTask.id, { onSuccess: done }); };
  return <Card className="p-5 sm:p-6"><ActivityHeader title="Tareas" description="Pendientes vinculados a la campaña seleccionada." action={canManage && selectedMemberId ? <Button onClick={openCreate}><Plus className="h-4 w-4" />Nueva tarea</Button> : undefined} /><CampaignContextSelector members={members} selectedMemberId={selectedMemberId} onChange={onChange} />{members.length === 0 ? <p className="py-10 text-center text-muted-foreground">Primero agrega este prospecto a una campaña para crear tareas.</p> : controller.query.isLoading ? <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div> : controller.query.isError ? <QueryError onRetry={() => void controller.query.refetch()} /> : controller.tasks.length === 0 ? <p className="py-10 text-center text-muted-foreground">No hay tareas registradas para esta campaña.</p> : <div className="grid gap-4 md:grid-cols-2">{controller.tasks.map((task, index) => <div key={task.id ?? index} className="rounded-xl border p-4"><div className="flex items-start gap-3">{task.is_done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}<div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className={`font-semibold ${task.is_done ? "text-muted-foreground line-through" : ""}`}>{task.title || "Tarea sin título"}</h3>{canManage && task.id && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Acciones de tarea</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => openEdit(task)}><Edit3 className="mr-2 h-4 w-4" />Editar</DropdownMenuItem><DropdownMenuItem onSelect={() => toggle(task)}>{task.is_done ? <Circle className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}{task.is_done ? "Marcar pendiente" : "Marcar completada"}</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeletingTask(task)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</div>{task.content && <p className="mt-2 text-sm leading-6 text-muted-foreground">{task.content}</p>}{task.due_date && <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground"><Clock3 className="h-4 w-4" />Vence: {formatLeadDate(task.due_date)}</p>}</div></div></div>)}</div>}<TaskDialog open={formOpen} onOpenChange={setFormOpen} task={editingTask} isPending={formMutation.isPending} error={formError} onSubmit={submit} /><DeleteTaskDialog task={deletingTask} onOpenChange={(open) => { if (!open) setDeletingTask(null); }} isPending={controller.deleteMutation.isPending} onConfirm={confirmDelete} /></Card>;
}
