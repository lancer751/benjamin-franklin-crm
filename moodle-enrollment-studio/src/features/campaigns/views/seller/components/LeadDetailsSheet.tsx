import { useState, useMemo, useEffect } from "react";
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
  X
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLead } from "@/features/leads/services/leadService";
import { FUNNEL_COLUMNS, KANBAN_STAGE_TO_ENUM, ENUM_TO_KANBAN_STAGE } from "../SellerLeadsView";

const typeIcons: Record<string, { icon: any; color: string; bg: string }> = {
  CALL: { icon: Phone, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20" },
  WHATSAPP: { icon: MessageSquare, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  EMAIL: { icon: Mail, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20" },
  MEETING: { icon: Users, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/20" },
};

interface LeadDetailsSheetProps {
  selectedLead: any;
  onClose: () => void;
  onStatusChange: (memberId: string, newStatus: string) => void;
  isStatusPending: boolean;
  setSelectedLead: React.Dispatch<React.SetStateAction<any>>;
  // Interactions
  interactions: any[];
  isLoadingInteractions: boolean;
  createInteractionMutation: any;
  // Tasks
  tasks: any[];
  isLoadingTasks: boolean;
  createTaskMutation: any;
  updateTaskMutation: any;
  deleteTaskMutation: any;
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

  useEffect(() => {
    if (selectedLead) {
      setEditFirstName(selectedLead.first_name || "");
      setEditLastName(selectedLead.last_name || "");
      setEditEmail(selectedLead.email || "");
    } else {
      setIsEditing(false);
    }
  }, [selectedLead]);

  // Interaction Form State
  const [newInteractionNotes, setNewInteractionNotes] = useState("");
  const [interactionType, setInteractionType] = useState<"CALL" | "WHATSAPP" | "MEETING" | "EMAIL" | "SELL">("CALL");

  // Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const selectedMemberId = useMemo(() => {
    return selectedLead?.campaignsEngaging?.[0]?.id || selectedLead?.id || "";
  }, [selectedLead]);

  const getPhone = (lead: any) => {
    if (!lead) return null; // <- Control de seguridad contra nulos
    if (lead.cellphone) return lead.cellphone;
    if (lead.phone) return lead.phone;
    if (lead.phones?.[0]?.number) return lead.phones[0].number;
    return null;
  };

  const formatSafeDate = (dateStr: string | null | undefined, pattern = "dd/MM/yyyy HH:mm") => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), pattern);
    } catch (e) {
      return dateStr;
    }
  };

  const handleCreateInteraction = async () => {
    if (!newInteractionNotes.trim()) {
      toast.error("Debes agregar una nota descriptiva");
      return;
    }
    try {
      await createInteractionMutation.mutateAsync({
        notes: newInteractionNotes,
        type: interactionType
      });
      setNewInteractionNotes("");
      setInteractionType("CALL");
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error("Debes especificar un título para la tarea");
      return;
    }
    const dueDate = newTaskDueDate || new Date(Date.now() + 86400000).toISOString().split("T")[0];
    try {
      await createTaskMutation.mutateAsync({
        title: newTaskTitle,
        content: newTaskContent,
        due_date: dueDate
      });
      setNewTaskTitle("");
      setNewTaskContent("");
      setNewTaskDueDate("");
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleToggleTask = (taskId: string, currentDone: boolean) => {
    updateTaskMutation.mutate({
      taskId,
      is_done: !currentDone
    });
  };

  const queryClient = useQueryClient();
  const leadId = selectedLead?.id || "";

  const { mutate: handleUpdateLead, isPending: isUpdatingLead } = useMutation({
    mutationFn: async (updatedData: any) => {
      return await updateLead(leadId, updatedData);
    },
    onSuccess: () => {
      setIsEditing(false);
      // Refrescar las queries activas para actualizar el Kanban y el panel
      queryClient.invalidateQueries({ queryKey: ["campaign-members"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-members-seller"] });
      
      // Actualizar localmente selectedLead
      setSelectedLead((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          first_name: editFirstName.trim(),
          last_name: editLastName.trim(),
          email: editEmail.trim(),
        };
      });

      toast.success("Información del prospecto actualizada exitosamente.");
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.message || "Error al actualizar la información del prospecto.");
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

    handleUpdateLead({
      first_name: editFirstName.trim(),
      last_name: editLastName.trim(),
      email: editEmail.trim(),
    });
  };

  const onCancelEdit = () => {
    if (selectedLead) {
      setEditFirstName(selectedLead.first_name || "");
      setEditLastName(selectedLead.last_name || "");
      setEditEmail(selectedLead.email || "");
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
                    value={ENUM_TO_KANBAN_STAGE[selectedLead.lead_status] || selectedLead.lead_status || "NUEVO"}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      onStatusChange(selectedMemberId, newStatus);
                      setSelectedLead((prev: any) => {
                        if (!prev) return null;
                        const nextStatusEnum = KANBAN_STAGE_TO_ENUM[newStatus] || newStatus;
                        return { ...prev, lead_status: nextStatusEnum };
                      });
                    }}
                    className="w-full h-8 px-2 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm"
                    disabled={isStatusPending}
                  >
                    {FUNNEL_COLUMNS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
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
                  {tasks.filter((t: any) => !t.is_done).length > 0 && (
                    <span className="bg-primary text-primary-foreground text-[9px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center font-extrabold shrink-0">
                      {tasks.filter((t: any) => !t.is_done).length}
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
                  <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <MessageSquare size={13} className="text-primary" /> Registrar Gestión Comercial
                    </Label>
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Canal de Gestión</Label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { value: "CALL", label: "Llamada", icon: Phone },
                          { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
                          { value: "MEETING", label: "Reunión", icon: Users },
                          { value: "EMAIL", label: "Correo", icon: Mail }
                        ].map((chan) => {
                          const Icon = chan.icon;
                          const isActive = interactionType === chan.value;
                          return (
                            <button
                              key={chan.value}
                              type="button"
                              onClick={() => setInteractionType(chan.value as any)}
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
                    </div>

                    <Textarea
                      placeholder="Escribe el resultado de la llamada o WhatsApp con el prospecto..."
                      value={newInteractionNotes}
                      onChange={(e) => setNewInteractionNotes(e.target.value)}
                      maxLength={255}
                      className="min-h-[80px] bg-slate-50/20 text-xs focus:bg-card border-border rounded-xl"
                      disabled={createInteractionMutation.isPending}
                    />
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {newInteractionNotes.length}/255 caracteres
                      </span>
                      <Button
                        onClick={handleCreateInteraction}
                        size="sm"
                        className="btn-primary font-bold text-xs h-8 px-4 rounded-lg shadow-sm flex items-center gap-1.5"
                        disabled={createInteractionMutation.isPending}
                      >
                        {createInteractionMutation.isPending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Plus size={12} />
                        )}
                        Registrar Bitácora
                      </Button>
                    </div>
                  </div>

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
                        {interactions.map((item: any) => {
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
                                    {item.type === "CALL" ? "Llamada" : 
                                     item.type === "WHATSAPP" ? "WhatsApp" : 
                                     item.type === "MEETING" ? "Reunión" : 
                                     item.type === "EMAIL" ? "Correo" : 
                                     item.type === "SELL" ? "Venta" : item.type}
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
                  <form onSubmit={handleCreateTask} className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-sm">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Plus size={13} className="text-primary" /> Crear Recordatorio / Tarea
                    </Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="¿Qué necesitas recordar? (ej. Volver a llamar)"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="h-8 bg-slate-50/20 text-xs border-border rounded-xl focus:bg-card"
                        disabled={createTaskMutation.isPending}
                        required
                      />
                      <Textarea
                        placeholder="Detalle o descripción de la tarea (opcional)..."
                        value={newTaskContent}
                        onChange={(e) => setNewTaskContent(e.target.value)}
                        className="min-h-[60px] bg-slate-50/20 text-xs border-border rounded-xl focus:bg-card"
                        disabled={createTaskMutation.isPending}
                      />
                      <div className="space-y-1">
                        <Label className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Fecha de vencimiento</Label>
                        <Input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="h-8 bg-slate-50/20 text-xs border-border rounded-xl focus:bg-card"
                          disabled={createTaskMutation.isPending}
                        />
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
                        Crear Tarea
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
                        {tasks.map((item: any) => (
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
                                  !item.is_done && new Date(item.due_date) < new Date() && "text-rose-500 font-extrabold"
                                )}>
                                  {formatSafeDate(item.due_date, "dd/MM/yyyy")}
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
