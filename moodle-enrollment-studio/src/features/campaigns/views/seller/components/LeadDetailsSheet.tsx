import { useState, useMemo, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { 
  Sheet, 
  SheetContent, 
  SheetTitle, 
  SheetDescription 
} from "@/core/components/ui/sheet";
import { Label } from "@/core/components/ui/label";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import { cn } from "@/core/lib/utils";
import { 
  Phone, 
  MessageSquare, 
  MessageCircle, 
  Users, 
  Mail, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Trash2,
  ClipboardList,
  Pencil,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLead } from "@/features/leads/services/leadService";
import {
  CAMPAIGN_MEMBER_STATUS_OPTIONS,
  isCampaignMemberStatus,
  type CampaignMemberStatus,
} from "@/core/constants/campaignMemberStatus";
import type { NormalizedLead } from "@/features/leads/adapters/leadAdapter";
import { interactionFormSchema, type InteractionFormValues } from "@/features/leads/schemas/interactionFormSchema";
import { taskFormSchema, type TaskFormInput, type TaskFormValues } from "@/features/leads/schemas/taskFormSchema";
import { INTERACTION_TYPE_OPTIONS, interactionTypeLabel } from "@/features/leads/utils/interactionType.constants";
import { mapInteractionFormToPayload, mapTaskFormToPayload } from "@/features/leads/utils/leadActionPayloadMappers";
import type { LeadInteraction, LeadTask } from "@/features/leads/components/lead-detail/leadDetail.types";

type InteractionPayload = ReturnType<typeof mapInteractionFormToPayload>;
type TaskPayload = ReturnType<typeof mapTaskFormToPayload>;
type UpdateLeadPayload = Parameters<typeof updateLead>[1];
type PanelInteraction = LeadInteraction & { id: string; type: string };
type PanelTask = LeadTask & { id: string; is_done: boolean };

interface CreateMutation<TVariables> {
  isPending: boolean;
  mutateAsync: (variables: TVariables) => Promise<unknown>;
}

interface ActionMutation<TVariables> {
  isPending: boolean;
  mutate: (variables: TVariables) => void;
}

interface LeadPhone {
  id?: string;
  number: string;
  type: string;
  isPrincipal?: boolean;
}

const typeIcons: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  CALL: { icon: Phone, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20" },
  WHATSAPP: { icon: MessageSquare, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  EMAIL: { icon: Mail, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20" },
  MEETING: { icon: Users, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/20" },
  SELL: { icon: CheckCircle2, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/20" },
  WEBSITE_FORM: { icon: ClipboardList, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-950/20" },
};

interface LeadDetailsSheetProps {
  selectedLead: NormalizedLead | null;
  onClose: () => void;
  onStatusChange: (memberId: string, newStatus: CampaignMemberStatus) => void;
  isStatusPending: boolean;
  setSelectedLead: React.Dispatch<React.SetStateAction<NormalizedLead | null>>;
  // Interactions
  interactions: PanelInteraction[];
  isLoadingInteractions: boolean;
  createInteractionMutation: CreateMutation<InteractionPayload>;
  // Tasks
  tasks: PanelTask[];
  isLoadingTasks: boolean;
  createTaskMutation: CreateMutation<TaskPayload>;
  updateTaskMutation: ActionMutation<{ taskId: string; is_done: boolean }>;
  deleteTaskMutation: ActionMutation<{ campaignId: string; memberId: string; taskId: string }>;
  selectedCampaignId: string;
}

export default function LeadDetailsSheet({
  selectedLead,
  onClose,
  onStatusChange,
  isStatusPending,
  setSelectedLead,
  interactions,
  isLoadingInteractions,
  createInteractionMutation,
  tasks,
  isLoadingTasks,
  createTaskMutation,
  updateTaskMutation,
  deleteTaskMutation,
  selectedCampaignId,
}: LeadDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState<"interactions" | "tasks">("interactions");

  // Local editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCellphone, setEditCellphone] = useState("");

  useEffect(() => {
    if (selectedLead) {
      setEditFirstName(selectedLead.first_name || "");
      setEditLastName(selectedLead.last_name || "");
      setEditEmail(selectedLead.email || "");
      const principalPhone = selectedLead.phones?.find((p: LeadPhone) => p.isPrincipal)?.number || "";
      setEditCellphone(principalPhone);
    } else {
      setIsEditing(false);
    }
  }, [selectedLead]);

  const interactionForm = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues: { type: "CALL", notes: "" },
    mode: "onTouched",
  });
  const taskForm = useForm<TaskFormInput, unknown, TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: "", content: "", due_date: "", is_done: false },
    mode: "onTouched",
  });
  const interactionType = interactionForm.watch("type");
  const interactionNotes = interactionForm.watch("notes") || "";
  const taskTitle = taskForm.watch("title") || "";
  const taskContent = taskForm.watch("content") || "";

  const selectedMemberId = useMemo(() => {
    return selectedLead?.campaignsEngaging?.[0]?.id || selectedLead?.id || "";
  }, [selectedLead]);

  const getPhone = (lead: NormalizedLead) => {
    return lead.phones?.find((phone) => phone.isPrincipal)?.number || lead.phones?.[0]?.number || null;
  };

  const formatSafeDate = (dateStr: string | null | undefined, pattern = "dd/MM/yyyy HH:mm") => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), pattern);
    } catch (e) {
      return dateStr;
    }
  };

  const handleCreateInteraction = interactionForm.handleSubmit(async (values) => {
    try {
      await createInteractionMutation.mutateAsync(mapInteractionFormToPayload(values));
      interactionForm.reset({ type: "CALL", notes: "" });
    } catch {
      // Error handled by mutation
    }
  });

  const handleCreateTask = taskForm.handleSubmit(async (values) => {
    try {
      await createTaskMutation.mutateAsync(mapTaskFormToPayload(values));
      taskForm.reset({ title: "", content: "", due_date: "", is_done: false });
    } catch {
      // Error handled by mutation
    }
  });

  const handleToggleTask = (taskId: string, currentDone: boolean) => {
    updateTaskMutation.mutate({
      taskId,
      is_done: !currentDone
    });
  };

  const queryClient = useQueryClient();
  const leadId = selectedLead?.id || "";

  const { mutate: handleUpdateLead, isPending: isUpdatingLead } = useMutation({
    mutationFn: async (updatedData: UpdateLeadPayload) => {
      return await updateLead(leadId, updatedData);
    },
    onSuccess: () => {
      setIsEditing(false);
      // Refrescar las queries activas para actualizar el Kanban y el panel
      queryClient.invalidateQueries({ queryKey: ["campaign-members"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-members-seller"] });
      
      // Actualizar localmente selectedLead
      setSelectedLead((prev) => {
        if (!prev) return null;
        
        let updatedPhones = prev.phones || [];
        const initialCellphone = prev.phones?.find((p: LeadPhone) => p.isPrincipal)?.number || "";
        
        if (editCellphone !== initialCellphone) {
          const hasPrincipal = updatedPhones.some((p: LeadPhone) => p.isPrincipal);
          if (hasPrincipal) {
            updatedPhones = updatedPhones.map((p: LeadPhone) => 
              p.isPrincipal ? { ...p, number: editCellphone, type: "WHATSAPP" } : p
            );
          } else {
            updatedPhones = [...updatedPhones, { number: editCellphone, type: "WHATSAPP", isPrincipal: true }];
          }
        }

        return {
          ...prev,
          first_name: editFirstName.trim(),
          last_name: editLastName.trim(),
          email: editEmail.trim(),
          phones: updatedPhones
        };
      });

      toast.success("Información del prospecto actualizada exitosamente.");
    },
    onError: (err: unknown) => {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error al actualizar la información del prospecto.");
    }
  });

  const onSaveEdit = () => {
    if (!editFirstName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!editLastName.trim()) {
      toast.error("El apellido es requerido");
      return;
    }
    if (!editEmail.trim()) {
      toast.error("El correo es requerido");
      return;
    }

    const updatedData: UpdateLeadPayload = {
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      email: editEmail.trim() || null,
    };

    const initialCellphone = selectedLead?.phones?.find((p: LeadPhone) => p.isPrincipal)?.number || "";
    if (editCellphone !== initialCellphone) {
      if (!/^9\d{8}$/.test(editCellphone)) {
        toast.error("El número de celular debe tener exactamente 9 dígitos y empezar con 9.");
        return;
      }
      updatedData.phones = [
        {
          number: editCellphone,
          type: "WHATSAPP",
          isPrincipal: true
        }
      ];
    }

    handleUpdateLead(updatedData);
  };

  const onCancelEdit = () => {
    if (selectedLead) {
      setEditFirstName(selectedLead.first_name || "");
      setEditLastName(selectedLead.last_name || "");
      setEditEmail(selectedLead.email || "");
      const principalPhone = selectedLead.phones?.find((p: LeadPhone) => p.isPrincipal)?.number || "";
      setEditCellphone(principalPhone);
    }
    setIsEditing(false);
  };

  const phone = selectedLead ? getPhone(selectedLead) : null;

  return (
    <Sheet open={!!selectedLead} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md w-full flex flex-col h-full bg-background border-l border-border p-0 shadow-2xl" side="right">
        {selectedLead && (
          <>
            {/* Header Panel */}
            <div className="p-6 border-b border-border space-y-4 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-md font-bold text-primary uppercase border border-primary/20 shrink-0">
                    {selectedLead.first_name?.[0] || ""}{selectedLead.last_name?.[0] || ""}
                  </div>
                  <div className="min-w-0 flex-1">
                    {!isEditing ? (
                      <>
                        <SheetTitle className="text-md font-extrabold text-foreground truncate flex items-center gap-2">
                          <span>{selectedLead.first_name} {selectedLead.last_name}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md shrink-0"
                            onClick={() => setIsEditing(true)}
                            title="Editar información"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground truncate">
                          {selectedLead.email || "Sin correo electrónico"}
                        </SheetDescription>
                      </>
                    ) : (
                      <div className="space-y-2 mt-1">
                        <div className="grid grid-cols-2 gap-1.5">
                          <Input
                            placeholder="Nombre"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            className="h-8 text-xs px-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/50"
                            disabled={isUpdatingLead}
                          />
                          <Input
                            placeholder="Apellido"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            className="h-8 text-xs px-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/50"
                            disabled={isUpdatingLead}
                          />
                        </div>
                        <Input
                          placeholder="Correo electrónico"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="h-8 text-xs px-2 rounded-lg w-full bg-slate-50/50 dark:bg-slate-900/50"
                          disabled={isUpdatingLead}
                        />
                        <Input
                          placeholder="Celular"
                          type="text"
                          value={editCellphone}
                          onChange={(e) => setEditCellphone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                          className="h-8 text-xs px-2 rounded-lg w-full bg-slate-50/50 dark:bg-slate-900/50"
                          disabled={isUpdatingLead}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isEditing && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg"
                        onClick={onSaveEdit}
                        disabled={isUpdatingLead}
                        title="Guardar cambios"
                      >
                        {isUpdatingLead ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                        onClick={onCancelEdit}
                        disabled={isUpdatingLead}
                        title="Cancelar edición"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Status Selector & Call Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                <div className="space-y-1">
                  <Label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Estado</Label>
                  <select
                    value={isCampaignMemberStatus(selectedLead.lead_status) ? selectedLead.lead_status : ""}
                    onChange={(event) => {
                      if (!isCampaignMemberStatus(event.target.value)) return;
                      const newStatus = event.target.value;
                      onStatusChange(selectedMemberId, newStatus);
                      setSelectedLead((prev) => prev ? { ...prev, lead_status: newStatus } : null);
                    }}
                    className="w-full h-8 px-2 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm"
                    disabled={isStatusPending}
                  >
                    {!isCampaignMemberStatus(selectedLead.lead_status) && <option value="" disabled>Estado desconocido</option>}
                    {CAMPAIGN_MEMBER_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-end">
                  {phone && (
                    <a
                      href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-650 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-950/40 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm"
                      title="Enviar WhatsApp"
                    >
                      <MessageSquare size={12} /> Chat
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 py-3 border-b border-border bg-slate-50/50 dark:bg-slate-900/10 shrink-0">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("interactions")}
                  className={cn(
                    "flex-1 text-xs py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5",
                    activeTab === "interactions"
                      ? "bg-white dark:bg-slate-700 shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MessageSquare size={13} />
                  Gestión
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={cn(
                    "flex-1 text-xs py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5",
                    activeTab === "tasks"
                      ? "bg-white dark:bg-slate-700 shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ClipboardList size={13} />
                  Tareas
                  {tasks.filter((task) => !task.is_done).length > 0 && (
                    <span className="bg-primary text-primary-foreground text-[9px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center font-extrabold shrink-0">
                      {tasks.filter((task) => !task.is_done).length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === "interactions" ? (
                <div className="space-y-6">
                  {/* Form to log interaction */}
                  <form onSubmit={handleCreateInteraction} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm" noValidate>
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <MessageSquare size={13} className="text-primary" /> Registrar Gestión Comercial
                    </Label>
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Canal de Gestión</Label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <input type="hidden" {...interactionForm.register("type")} />
                        {INTERACTION_TYPE_OPTIONS.map((chan) => {
                          const Icon = typeIcons[chan.value]?.icon || MessageSquare;
                          const isActive = interactionType === chan.value;
                          return (
                            <button
                              key={chan.value}
                              type="button"
                              onClick={() => interactionForm.setValue("type", chan.value, { shouldTouch: true, shouldValidate: true })}
                              className={cn(
                                "flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-[9px] font-bold gap-1 transition-all shadow-sm",
                                isActive
                                  ? "bg-primary/10 text-primary border-primary shadow-inner font-extrabold"
                                  : "bg-card border-border text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-foreground"
                              )}
                            >
                              <Icon size={13} className={isActive ? "text-primary" : "text-muted-foreground/80"} />
                              {chan.label}
                            </button>
                          );
                        })}
                      </div>
                      {interactionForm.formState.errors.type && <p role="alert" className="text-[10px] text-destructive">{interactionForm.formState.errors.type.message}</p>}
                    </div>

                    <Textarea
                      id="panel-interaction-notes"
                      placeholder="Escribe el resultado de la llamada o WhatsApp con el prospecto..."
                      maxLength={255}
                      aria-invalid={Boolean(interactionForm.formState.errors.notes)}
                      aria-describedby={interactionForm.formState.errors.notes ? "panel-interaction-notes-error" : undefined}
                      className="min-h-[80px] bg-slate-50/20 text-xs focus:bg-card border-border rounded-xl"
                      disabled={createInteractionMutation.isPending}
                      {...interactionForm.register("notes")}
                    />
                    {interactionForm.formState.errors.notes && <p id="panel-interaction-notes-error" role="alert" className="text-[10px] text-destructive">{interactionForm.formState.errors.notes.message}</p>}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {interactionNotes.length}/255 caracteres
                      </span>
                      <Button
                        type="submit"
                        size="sm"
                        className="btn-primary font-bold text-xs h-8 px-4 rounded-lg shadow-sm flex items-center gap-1.5"
                        disabled={createInteractionMutation.isPending}
                      >
                        {createInteractionMutation.isPending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Plus size={12} />
                        )}
                        {createInteractionMutation.isPending ? "Registrando..." : "Registrar Bitácora"}
                      </Button>
                    </div>
                  </form>

                  {/* Timeline List */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      Historial de Interacciones
                    </h4>
                    {isLoadingInteractions ? (
                      <div className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                      </div>
                    ) : interactions.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-border/80">
                        <p className="text-xs font-medium">Sin interacciones registradas.</p>
                      </div>
                    ) : (
                      <div className="relative pl-4 space-y-4 border-l border-border/80 ml-2 pt-1">
                        {interactions.map((item) => {
                          const config = typeIcons[item.type] || { icon: MessageSquare, color: "text-slate-500", bg: "bg-slate-100" };
                          const Icon = config.icon;
                          return (
                            <div key={item.id} className="relative group">
                              {/* Dotted Indicator */}
                              <span className={cn("absolute -left-[23px] top-0 h-5 w-5 rounded-full flex items-center justify-center border border-border bg-background shadow-sm text-center text-muted-foreground", config.color)}>
                                <Icon size={9} />
                              </span>
                              <div className="bg-card border border-border rounded-xl p-3.5 space-y-2 shadow-sm group-hover:border-primary/30 transition-colors">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                                  <span className={cn("px-1.5 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wider", config.bg, config.color)}>
                                    {interactionTypeLabel(item.type)}
                                  </span>
                                  <span>{formatSafeDate(item.created_at)}</span>
                                </div>
                                <p className="text-xs text-foreground leading-relaxed break-words">
                                  {item.notes}
                                </p>
                                <div className="text-[9px] text-muted-foreground font-medium flex items-center gap-1 border-t border-border/40 pt-1.5">
                                  <span>Por:</span>
                                  <span className="font-semibold text-foreground">{item.created_by || "Asesor Comercial"}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Form to create task */}
                  <form onSubmit={handleCreateTask} className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-sm" noValidate>
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Plus size={13} className="text-primary" /> Crear Recordatorio / Tarea
                    </Label>
                    <div className="space-y-2">
                      <Input
                        id="panel-task-title"
                        placeholder="¿Qué necesitas recordar? (ej. Volver a llamar)"
                        maxLength={100}
                        aria-invalid={Boolean(taskForm.formState.errors.title)}
                        aria-describedby={taskForm.formState.errors.title ? "panel-task-title-error" : undefined}
                        className="h-8 bg-slate-50/20 text-xs border-border rounded-xl focus:bg-card"
                        disabled={createTaskMutation.isPending}
                        {...taskForm.register("title")}
                      />
                      <div className="flex items-start justify-between gap-2">
                        {taskForm.formState.errors.title ? <p id="panel-task-title-error" role="alert" className="text-[10px] text-destructive">{taskForm.formState.errors.title.message}</p> : <span />}
                        <span className="shrink-0 text-[10px] text-muted-foreground">{taskTitle.length}/100</span>
                      </div>
                      <Textarea
                        id="panel-task-content"
                        placeholder="Detalle o descripción de la tarea..."
                        maxLength={500}
                        aria-invalid={Boolean(taskForm.formState.errors.content)}
                        aria-describedby={taskForm.formState.errors.content ? "panel-task-content-error" : undefined}
                        className="min-h-[60px] bg-slate-50/20 text-xs border-border rounded-xl focus:bg-card"
                        disabled={createTaskMutation.isPending}
                        {...taskForm.register("content")}
                      />
                      <div className="flex items-start justify-between gap-2">
                        {taskForm.formState.errors.content ? <p id="panel-task-content-error" role="alert" className="text-[10px] text-destructive">{taskForm.formState.errors.content.message}</p> : <span />}
                        <span className="shrink-0 text-[10px] text-muted-foreground">{taskContent.length}/500</span>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Fecha de vencimiento (opcional)</Label>
                        <Input
                          id="panel-task-due-date"
                          type="date"
                          aria-invalid={Boolean(taskForm.formState.errors.due_date)}
                          aria-describedby={taskForm.formState.errors.due_date ? "panel-task-due-date-help panel-task-due-date-error" : "panel-task-due-date-help"}
                          className="h-8 bg-slate-50/20 text-xs border-border rounded-xl focus:bg-card"
                          disabled={createTaskMutation.isPending}
                          {...taskForm.register("due_date")}
                        />
                        <p id="panel-task-due-date-help" className="text-[10px] text-muted-foreground">Puedes crear la tarea sin una fecha definida.</p>
                        {taskForm.formState.errors.due_date && <p id="panel-task-due-date-error" role="alert" className="text-[10px] text-destructive">{taskForm.formState.errors.due_date.message}</p>}
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <Button
                        type="submit"
                        size="sm"
                        className="btn-primary font-bold text-xs h-8 px-4 rounded-lg shadow-sm"
                        disabled={createTaskMutation.isPending}
                      >
                        {createTaskMutation.isPending ? (
                          <Loader2 size={12} className="animate-spin mr-1.5" />
                        ) : (
                          <Plus size={12} className="mr-1.5" />
                        )}
                        {createTaskMutation.isPending ? "Creando..." : "Crear Tarea"}
                      </Button>
                    </div>
                  </form>

                  {/* Tasks List */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      Tareas Asignadas
                    </h4>
                    {isLoadingTasks ? (
                      <div className="space-y-3">
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-border/80">
                        <p className="text-xs font-medium">Sin tareas pendientes de seguimiento.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {tasks.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card shadow-sm transition-all duration-200",
                              item.is_done && "bg-slate-50/50 dark:bg-slate-900/5 opacity-70 border-border/60"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleTask(item.id, item.is_done)}
                              className={cn(
                                "mt-0.5 h-4 w-4 rounded border border-border flex items-center justify-center transition-all shrink-0 focus:outline-none",
                                item.is_done
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "hover:border-primary/50 bg-background"
                              )}
                              disabled={updateTaskMutation.isPending}
                            >
                              {item.is_done && <CheckCircle2 size={11} className="stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0 space-y-1">
                              <h5 className={cn(
                                "font-bold text-xs leading-none text-foreground truncate",
                                item.is_done && "line-through text-muted-foreground"
                              )}>
                                {item.title}
                              </h5>
                              {item.content && (
                                <p className={cn(
                                  "text-[11px] text-muted-foreground leading-normal break-words",
                                  item.is_done && "line-through"
                                )}>
                                  {item.content}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground pt-1 border-t border-border/30 mt-1">
                                <Clock size={10} />
                                <span>Vence:</span>
                                <span className={cn(
                                  "text-foreground",
                                   !item.is_done && item.due_date && new Date(item.due_date) < new Date() && "text-rose-500 font-extrabold"
                                )}>
                                  {item.due_date ? formatSafeDate(item.due_date, "dd/MM/yyyy") : "Sin fecha definida"}
                                </span>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 self-center"
                              disabled={deleteTaskMutation.isPending}
                              onClick={() => deleteTaskMutation.mutate({ 
                                campaignId: selectedCampaignId, 
                                memberId: selectedMemberId, 
                                taskId: item.id 
                              })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
