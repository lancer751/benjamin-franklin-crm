import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/core/lib/api";
import { getCampaigns } from "@/features/campaigns/services/campaignService";
import { 
  getCampaignMembers, 
  updateMemberStatus,
  getMemberInteractions,
  createMemberInteraction,
  getMemberTasks,
  createMemberTask,
  updateMemberTask,
  deleteMemberTask
} from "@/features/leads/services/leadService";
import { adaptCampaignMembers, unpackLeads } from "@/features/leads/adapters/leadAdapter";
import { Button } from "@/core/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { Skeleton } from "@/core/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/core/lib/utils";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/core/components/ui/sheet";
import { 
  Users, 
  Search, 
  Calendar, 
  Phone, 
  Mail, 
  Edit, 
  MessageSquare, 
  Loader2, 
  RefreshCw,
  UserCheck,
  Plus,
  CheckCircle2,
  Clock,
  ClipboardList,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

// Mapeo de columnas y configuraciones de estilo
const STAGES = [
  { id: "ACTIVE", label: "Nuevo / Activo", color: "border-blue-200 bg-blue-50/20 text-blue-700 dark:text-blue-400 dark:bg-blue-950/10", dotColor: "bg-blue-500" },
  { id: "stage_Volver_a_llamar", label: "Volver a Llamar", color: "border-amber-200 bg-amber-50/20 text-amber-700 dark:text-amber-400 dark:bg-amber-950/10", dotColor: "bg-amber-500" },
  { id: "stage_Muy_interesado", label: "Muy Interesado", color: "border-purple-200 bg-purple-50/20 text-purple-700 dark:text-purple-400 dark:bg-purple-950/10", dotColor: "bg-purple-500" },
  { id: "stage_No_contesta", label: "No Contesta", color: "border-orange-200 bg-orange-50/20 text-orange-700 dark:text-orange-400 dark:bg-orange-950/10", dotColor: "bg-orange-500" },
  { id: "stage_No_interesado", label: "No Interesado", color: "border-rose-200 bg-rose-50/20 text-rose-700 dark:text-rose-400 dark:bg-rose-950/10", dotColor: "bg-rose-500" }
];

const KANBAN_STAGE_TO_ENUM: Record<string, string> = {
  ACTIVE: "NEW",
  stage_Nuevo: "NEW",
  stage_Volver_a_llamar: "FOLLOW_UP",
  stage_Muy_interesado: "QUALIFIED",
  stage_No_contesta: "ATTEMPTED_CONTACT",
  stage_No_interesado: "LOST"
};

const ENUM_TO_KANBAN_STAGE: Record<string, string> = {
  NEW: "ACTIVE",
  FOLLOW_UP: "stage_Volver_a_llamar",
  QUALIFIED: "stage_Muy_interesado",
  ATTEMPTED_CONTACT: "stage_No_contesta",
  LOST: "stage_No_interesado",
  UNQUALIFIED: "stage_No_interesado",
  WON: "stage_Muy_interesado"
};
  
const typeIcons: Record<string, { icon: any; color: string; bg: string }> = {
  CALL: { icon: Phone, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20" },
  WHATSAPP: { icon: MessageSquare, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  EMAIL: { icon: Mail, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/20" },
  MEETING: { icon: Calendar, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/20" },
};

const getPhone = (lead: any) => {
  if (lead.cellphone) return lead.cellphone;
  if (lead.phone) return lead.phone;
  if (lead.phones?.[0]?.number) return lead.phones[0].number;
  return null;
};

const SellerLeadsView = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const sellerId = user?.seller?.id || user?.id;

  const { campaignId: routeCampaignId } = useParams<{ campaignId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCampaignId = routeCampaignId || searchParams.get("campaignId") || "";
  const [searchQuery, setSearchQuery] = useState("");

  // Estado para el lead seleccionado (Sheet lateral)
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"interactions" | "tasks">("interactions");

  // Estado para nuevas interacciones
  const [newInteractionNotes, setNewInteractionNotes] = useState("");

  // Estado para nuevas tareas
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  // Obtener el memberId del lead seleccionado
  const selectedMemberId = useMemo(() => {
    return selectedLead?.campaignsEngaging?.[0]?.id || selectedLead?.id || "";
  }, [selectedLead]);

  // Safe Date formatter
  const formatSafeDate = (dateStr: string | null | undefined, pattern = "dd/MM/yyyy HH:mm") => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), pattern);
    } catch (e) {
      return dateStr;
    }
  };

  // 1. Obtener campañas asignadas al vendedor
  const { data: campaignsRes, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns-list-seller", sellerId],
    queryFn: () => getCampaigns(),
    enabled: !!sellerId,
  });

  const campaigns = (campaignsRes as any)?.data?.data?.campaings
    || (campaignsRes as any)?.data?.campaings
    || (campaignsRes as any)?.campaings
    || (campaignsRes as any)?.data
    || [];

  const sellerCampaigns = useMemo(() => {
    return campaigns.filter((c: any) => {
      const sellersList = c.sellers || [];
      return sellersList.some(
        (s: any) =>
          s.seller_id === sellerId ||
          s.seller?.id === sellerId ||
          s.id === sellerId
      );
    });
  }, [campaigns, sellerId]);

  // Preseleccionar la primera campaña si no hay seleccionada en los query params
  useEffect(() => {
    if (sellerCampaigns.length > 0 && !selectedCampaignId) {
      setSearchParams({ campaignId: sellerCampaigns[0].id });
    }
  }, [sellerCampaigns, selectedCampaignId, setSearchParams]);

  // 2. Obtener los leads de la campaña seleccionada asignados a este asesor
  const { data: membersRes, isLoading: isLoadingLeads, isError: isErrorLeads } = useQuery({
    queryKey: ["campaign-members-seller", selectedCampaignId, sellerId],
    queryFn: () => getCampaignMembers(selectedCampaignId, { assigned_to: sellerId }),
    enabled: !!selectedCampaignId && !!sellerId,
  });

  const leads = useMemo(() => {
    const rawData = unpackLeads(membersRes);
    return adaptCampaignMembers(rawData);
  }, [membersRes]);

  // 3. Consultas e interacciones para el lead seleccionado en el Sheet lateral
  const { data: interactionsRes, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ["member-interactions", selectedMemberId],
    queryFn: () => getMemberInteractions(selectedCampaignId, selectedMemberId),
    enabled: !!selectedCampaignId && !!selectedMemberId,
  });

  const interactions = useMemo(() => {
    return interactionsRes?.data || (Array.isArray(interactionsRes) ? interactionsRes : []);
  }, [interactionsRes]);

  // 4. Consultas de tareas para el lead seleccionado en el Sheet lateral
  const { data: tasksRes, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["member-tasks", selectedMemberId],
    queryFn: () => getMemberTasks(selectedCampaignId, selectedMemberId),
    enabled: !!selectedCampaignId && !!selectedMemberId,
  });

  const tasks = useMemo(() => {
    return tasksRes?.data || (Array.isArray(tasksRes) ? tasksRes : []);
  }, [tasksRes]);

  // Mutación para registrar interacciones (POST /api/campaigns/:campaignId/members/:memberId/interactions)
  const createInteractionMutation = useMutation({
    mutationFn: (payload: { notes: string; type: "CALL" | "WHATSAPP" }) =>
      createMemberInteraction(
        selectedCampaignId,
        selectedMemberId,
        payload.notes,
        payload.type,
        user?.seller?.id || ""
      ),
    onSuccess: () => {
      toast.success("Interacción registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["member-interactions", selectedMemberId] });
      setNewInteractionNotes("");
    },
    onError: () => {
      toast.error("Error al registrar la interacción");
    }
  });

  // Mutación para crear tareas/recordatorios (POST /api/campaigns/:campaignId/members/:memberId/tasks)
  const createTaskMutation = useMutation({
    mutationFn: async (payload: { title: string; content: string; due_date: string }) => {
      const sellerProfileId = user?.seller?.id;
      if (!sellerProfileId) {
        throw new Error("Error: No se identificó tu perfil de asesor de ventas.");
      }
      console.log("Enviando x-seller-id:", user?.seller?.id);
      const res = await (api.campaigns as any)[":campaignId"].members[":memberId"].tasks.$post({
        param: { campaignId: selectedCampaignId, memberId: selectedMemberId },
        json: {
          title: payload.title,
          content: payload.content,
          is_done: false,
          due_date: payload.due_date,
        },
        headers: {
          "x-seller-id": sellerProfileId
        }
      } as any, {
        headers: {
          "x-seller-id": sellerProfileId
        }
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Tarea registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["member-tasks", selectedMemberId] });
      setNewTaskTitle("");
      setNewTaskContent("");
      setNewTaskDueDate("");
    },
    onError: () => {
      toast.error("Error al registrar la tarea");
    }
  });

  // Mutación para marcar la tarea como completada (PATCH /api/campaigns/:campaignId/members/:memberId/tasks/:taskId)
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, is_done }: { taskId: string; is_done: boolean }) =>
      updateMemberTask(selectedCampaignId, selectedMemberId, taskId, { is_done }),
    onSuccess: () => {
      toast.success("Tarea actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: ["member-tasks", selectedMemberId] });
    },
    onError: () => {
      toast.error("Error al actualizar la tarea");
    }
  });

  // Mutación para eliminar tareas (DELETE /api/campaigns/:campaignId/members/:memberId/tasks/:taskId)
  const deleteTaskMutation = useMutation({
    mutationFn: ({ campaignId, memberId, taskId }: { campaignId: string; memberId: string; taskId: string }) =>
      deleteMemberTask(campaignId, memberId, taskId),
    onSuccess: () => {
      toast.success("Tarea eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ["member-tasks", selectedMemberId] });
    },
    onError: () => {
      toast.error("Error al eliminar la tarea");
    }
  });

  // Mutación para actualizar la tipificación (status)
  const updateStatusMutation = useMutation({
    mutationFn: ({ memberId, status }: { memberId: string; status: string }) =>
      updateMemberStatus(selectedCampaignId, memberId, status),
    onSuccess: () => {
      toast.success("Tipificación de lead actualizada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["campaign-members-seller", selectedCampaignId, sellerId] });
      queryClient.invalidateQueries({ queryKey: ["campaign-members", selectedCampaignId] });
    },
    onError: () => {
      toast.error("Ocurrió un error al actualizar el estado del lead.");
    }
  });

  const handleStatusChange = (memberId: string, newStatus: string) => {
    const backendStatus = KANBAN_STAGE_TO_ENUM[newStatus] || newStatus;
    updateStatusMutation.mutate({ memberId, status: backendStatus });
  };

  const handleCampaignChange = (val: string) => {
    setSearchParams({ campaignId: val });
  };

  const handleCreateInteraction = (type: "CALL" | "WHATSAPP") => {
    if (!newInteractionNotes.trim()) {
      toast.error("Debes agregar una nota descriptiva");
      return;
    }
    createInteractionMutation.mutate({
      notes: newInteractionNotes,
      type
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const sellerProfileId = user?.seller?.id;
    if (!sellerProfileId) {
      toast.error("Error: No se identificó tu perfil de asesor de ventas.");
      return;
    }
    if (!newTaskTitle.trim()) {
      toast.error("Debes especificar un título para la tarea");
      return;
    }
    createTaskMutation.mutate({
      title: newTaskTitle,
      content: newTaskContent,
      due_date: newTaskDueDate || new Date(Date.now() + 86400000).toISOString().split("T")[0] // default mañana
    });
  };

  const handleToggleTask = (taskId: string, currentDone: boolean) => {
    // Si ya está completada, la mandamos como false, si no como true. El backend pide is_done: true para completada.
    updateTaskMutation.mutate({
      taskId,
      is_done: !currentDone
    });
  };

  // Filtrado de leads por la barra de búsqueda (nombre, email o celular)
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter((l: any) => {
      const fullName = `${l.first_name || ""} ${l.last_name || ""}`.toLowerCase();
      const email = (l.email || "").toLowerCase();
      const phone = (getPhone(l) || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [leads, searchQuery]);

  // Agrupamiento por etapa
  const leadsByStage = useMemo(() => {
    const groups: Record<string, any[]> = {
      ACTIVE: [],
      stage_Volver_a_llamar: [],
      stage_Muy_interesado: [],
      stage_No_contesta: [],
      stage_No_interesado: []
    };

    filteredLeads.forEach((lead: any) => {
      const status = lead.lead_status || "ACTIVE";
      const mappedStage = ENUM_TO_KANBAN_STAGE[status] || status;
      if (groups[mappedStage]) {
        groups[mappedStage].push(lead);
      } else {
        groups["ACTIVE"].push(lead);
      }
    });

    return groups;
  }, [filteredLeads]);

  const selectedCampaignName = useMemo(() => {
    const camp = sellerCampaigns.find((c: any) => c.id === selectedCampaignId);
    return camp?.name || "Campaña";
  }, [sellerCampaigns, selectedCampaignId]);

  return (
    <div className="space-y-6 fade-in">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="text-primary h-6 w-6" /> Funnel de Tipificación
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza tu pipeline de leads en {selectedCampaignName} y actualiza sus estados en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Campaña */}
          <div className="min-w-[200px]">
            <Select value={selectedCampaignId} onValueChange={handleCampaignChange}>
              <SelectTrigger className="w-full h-9 bg-card rounded-xl border-border shadow-sm">
                <SelectValue placeholder="Seleccionar campaña" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCampaigns ? (
                  <SelectItem value="loading" disabled>Cargando campañas...</SelectItem>
                ) : sellerCampaigns.length === 0 ? (
                  <SelectItem value="empty" disabled>Sin campañas</SelectItem>
                ) : (
                  sellerCampaigns.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["campaign-members-seller"] })}
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
            title="Refrescar leads"
            disabled={isLoadingLeads}
          >
            <RefreshCw className={cn("h-4 w-4", isLoadingLeads && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Control Bar: Search and Filter Info */}
      <div className="flex items-center gap-3 rounded-xl bg-card border border-border p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar prospecto por nombre, email o celular..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-slate-50/20 focus:bg-card border-border rounded-xl text-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground font-semibold ml-auto flex items-center gap-1.5">
          <Users size={14} className="text-primary/70" />
          Total leads en pantalla: <span className="font-extrabold text-foreground">{filteredLeads.length}</span>
        </div>
      </div>

      {/* Kanban Board Funnel Lanes */}
      {isLoadingLeads ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {STAGES.map((stage) => (
            <div key={stage.id} className="rounded-2xl border border-border p-4 bg-slate-50/20 space-y-4">
              <Skeleton className="h-6 w-2/3 mb-4" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : isErrorLeads ? (
        <div className="rounded-2xl border border-dashed border-destructive/30 p-12 text-center text-destructive bg-destructive/5">
          <p className="font-bold">Error al conectar con el servidor para obtener los miembros de la campaña.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {STAGES.map((stage) => {
            const laneLeads = leadsByStage[stage.id] || [];

            return (
              <div
                key={stage.id}
                className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm h-[70vh] hover:shadow transition-all duration-300"
              >
                {/* Lane Header */}
                <div className={cn("px-4 py-3.5 border-b flex items-center justify-between font-bold text-xs tracking-wider uppercase", stage.color)}>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", stage.dotColor)} />
                    {stage.label}
                  </div>
                  <span className="bg-white/40 dark:bg-black/20 text-foreground px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    {laneLeads.length}
                  </span>
                </div>

                {/* Lane Body Scrollable */}
                <div className="p-3 overflow-y-auto flex-1 space-y-3 bg-slate-50/30 dark:bg-slate-900/10">
                  {laneLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground/60 select-none">
                      <Users size={28} className="opacity-20 mb-2" />
                      <p className="text-[10px] font-medium">Sin prospectos en esta etapa</p>
                    </div>
                  ) : (
                    laneLeads.map((lead: any) => {
                      const phone = getPhone(lead);
                      const formattedPhone = phone ? phone.replace(/\D/g, "") : "";
                      const whatsappUrl = formattedPhone ? `https://wa.me/${formattedPhone}` : "";
                      const displayDate = formatSafeDate(lead.created_at, "dd/MM/yy HH:mm");
                      const memberId = lead.campaignsEngaging?.[0]?.id || lead.id || "";

                      return (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="bg-card border border-border rounded-xl p-3.5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 group relative space-y-3 cursor-pointer"
                        >
                          {/* Top Lead Info */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors">
                              {lead.first_name} {lead.last_name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar size={11} /> {displayDate}
                            </p>
                          </div>

                          {/* Contact Details */}
                          <div className="space-y-1 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                            {phone && (
                              <p className="flex items-center gap-1.5 font-medium text-foreground">
                                <Phone size={10} className="text-muted-foreground/80" /> {phone}
                              </p>
                            )}
                            {lead.email && (
                              <p className="flex items-center gap-1.5 truncate" title={lead.email}>
                                <Mail size={10} className="text-muted-foreground/80" /> {lead.email}
                              </p>
                            )}
                          </div>

                          {/* Action Bar / Dropdown to change stage */}
                          <div 
                            className="pt-2 border-t border-border/40 flex items-center justify-between gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="w-full">
                              <select
                                value={ENUM_TO_KANBAN_STAGE[lead.lead_status] || lead.lead_status || "ACTIVE"}
                                onChange={(e) => handleStatusChange(memberId, e.target.value)}
                                className="w-full h-7 px-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm"
                                disabled={updateStatusMutation.isPending}
                              >
                                {STAGES.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    Mover a: {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Quick External Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 w-7 rounded-lg border border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-muted-foreground hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageSquare size={13} />
                                </a>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/prospectos/${lead.id}/editar`)}
                                className="h-7 w-7 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all shadow-sm"
                                title="Editar Prospecto"
                              >
                                <Edit size={12} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lateral Sheet of Details */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="sm:max-w-md w-full flex flex-col h-full bg-background border-l border-border p-0 shadow-2xl" side="right">
          {selectedLead && (
            <>
              {/* Header Panel */}
              <div className="p-6 border-b border-border space-y-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-md font-bold text-primary uppercase border border-primary/20 shrink-0">
                    {selectedLead.first_name?.[0] || ""}{selectedLead.last_name?.[0] || ""}
                  </div>
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="text-md font-extrabold text-foreground truncate">
                      {selectedLead.first_name} {selectedLead.last_name}
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground truncate">
                      {selectedLead.email || "Sin correo electrónico"}
                    </SheetDescription>
                  </div>
                </div>

                {/* Status Selector & Call Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Estado</Label>
                    <select
                      value={ENUM_TO_KANBAN_STAGE[selectedLead.lead_status] || selectedLead.lead_status || "ACTIVE"}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        handleStatusChange(selectedMemberId, newStatus);
                        setSelectedLead((prev: any) => prev ? { ...prev, lead_status: newStatus } : null);
                      }}
                      className="w-full h-8 px-2 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm"
                      disabled={updateStatusMutation.isPending}
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-1.5 justify-end">
                    {getPhone(selectedLead) && (
                      <a
                        href={`tel:${getPhone(selectedLead)}`}
                        className="h-8 flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-950/40 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm"
                        title="Llamar"
                      >
                        <Phone size={12} /> Llamar
                      </a>
                    )}
                    {getPhone(selectedLead) && (
                      <a
                        href={`https://wa.me/${getPhone(selectedLead).replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 flex-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/40 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-sm"
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
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleCreateInteraction("CALL")}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-sm gap-1 flex items-center"
                            disabled={createInteractionMutation.isPending}
                          >
                            {createInteractionMutation.isPending && createInteractionMutation.variables?.type === "CALL" ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Phone size={12} />
                            )}
                            Llamada
                          </Button>
                          <Button
                            onClick={() => handleCreateInteraction("WHATSAPP")}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-sm gap-1 flex items-center"
                            disabled={createInteractionMutation.isPending}
                          >
                            {createInteractionMutation.isPending && createInteractionMutation.variables?.type === "WHATSAPP" ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <MessageSquare size={12} />
                            )}
                            WhatsApp
                          </Button>
                        </div>
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
                                      {item.type === "CALL" ? "Llamada" : "WhatsApp"}
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
    </div>
  );
};

export default SellerLeadsView;
