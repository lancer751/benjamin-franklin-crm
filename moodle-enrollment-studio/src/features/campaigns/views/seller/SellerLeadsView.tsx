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
  updateMemberTask,
  deleteMemberTask,
  createLead,
  addLeadToCampaign
} from "@/features/leads/services/leadService";
import { adaptCampaignMembers, unpackLeads } from "@/features/leads/adapters/leadAdapter";
import { Button } from "@/core/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Input } from "@/core/components/ui/input";
import { Skeleton } from "@/core/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/core/lib/utils";
import { 
  Users, 
  Search, 
  RefreshCw,
  UserCheck,
  Plus,
  ArrowLeft,
} from "lucide-react";
import KanbanColumn from "./components/KanbanColumn";
import LeadDetailsSheet from "./components/LeadDetailsSheet";
import NewLeadModal from "./components/NewLeadModal";

// Mapeo de columnas y configuraciones de estilo
export const FUNNEL_COLUMNS = [
  { id: "NUEVO", label: "NUEVO", backendStatuses: ["NEW"], borderStyle: "border-blue-200 bg-blue-50/20 text-blue-700 dark:text-blue-400 dark:bg-blue-950/10", dotColor: "bg-blue-500" },
  { id: "CONTACTADO", label: "CONTACTADO", backendStatuses: ["CONTACTED", "FOLLOW_UP"], borderStyle: "border-amber-200 bg-amber-50/20 text-amber-700 dark:text-amber-400 dark:bg-amber-950/10", dotColor: "bg-amber-500" },
  { id: "NO_CONTACTADO", label: "NO CONTACTADO", backendStatuses: ["ATTEMPTED_CONTACT"], borderStyle: "border-purple-200 bg-purple-50/20 text-purple-700 dark:text-purple-400 dark:bg-purple-950/10", dotColor: "bg-purple-500" },
  { id: "PREVENTA_CITA", label: "PREVENTA - CITA", backendStatuses: ["QUALIFIED", "ON_HOLD"], borderStyle: "border-indigo-200 bg-indigo-50/20 text-indigo-700 dark:text-indigo-400 dark:bg-indigo-950/10", dotColor: "bg-indigo-500" },
  { id: "MATRICULADO", label: "MATRICULADO", backendStatuses: ["WON"], borderStyle: "border-2 border-emerald-350 bg-emerald-50/30 text-emerald-800 dark:text-emerald-450 dark:bg-emerald-950/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]", dotColor: "bg-emerald-500" },
  { id: "DESCARTADO", label: "DESCARTADO", backendStatuses: ["LOST", "UNQUALIFIED"], borderStyle: "border-rose-200 bg-rose-50/20 text-rose-700 dark:text-rose-400 dark:bg-rose-950/10", dotColor: "bg-rose-500" }
];

export const KANBAN_STAGE_TO_ENUM: Record<string, string> = {
  NUEVO: "NEW",
  CONTACTADO: "CONTACTED",
  NO_CONTACTADO: "ATTEMPTED_CONTACT",
  PREVENTA_CITA: "QUALIFIED",
  MATRICULADO: "WON",
  DESCARTADO: "LOST",
};

export const ENUM_TO_KANBAN_STAGE: Record<string, string> = {
  NEW: "NUEVO",
  CONTACTED: "CONTACTADO",
  FOLLOW_UP: "CONTACTADO",
  ATTEMPTED_CONTACT: "NO_CONTACTADO",
  QUALIFIED: "PREVENTA_CITA",
  ON_HOLD: "PREVENTA_CITA",
  WON: "MATRICULADO",
  LOST: "DESCARTADO",
  UNQUALIFIED: "DESCARTADO",
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
  const sellerId = user?.seller?.id;

  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCampaignId = campaignId || searchParams.get("campaignId") || "";
  const [searchQuery, setSearchQuery] = useState("");

  // Estado para el lead seleccionado (Sheet lateral)
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Obtener el memberId del lead seleccionado
  const selectedMemberId = useMemo(() => {
    return selectedLead?.campaignsEngaging?.[0]?.id || selectedLead?.id || "";
  }, [selectedLead]);

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
    mutationFn: (payload: { notes: string; type: "CALL" | "WHATSAPP" | "MEETING" | "EMAIL" | "SELL" }) =>
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
    },
    onError: (err) => {
      console.error(err);
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

  // Estado para el modal de registro manual de lead
  const [isOpenNewLeadModal, setIsOpenNewLeadModal] = useState(false);

  // Mutación secuencial de registro manual de lead
  const createManualLeadMutation = useMutation({
    mutationFn: async (payload: { first_name: string; last_name: string; email: string; cellphone: string }) => {
      if (!sellerId) {
        throw new Error("No se identificó el perfil de asesor de ventas.");
      }
      if (!selectedCampaignId) {
        throw new Error("No hay una campaña activa seleccionada.");
      }

      // Paso 1: Invoca createLead
      const leadPayload = {
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phones: [{ number: payload.cellphone, type: "WHATSAPP" as const }],
        status: "ACTIVE",
        gender: "NOT_SPECIFIED" as const
      };

      const leadResponse = (await createLead(leadPayload as any, sellerId)) as any;
      
      // Paso 2: Extrae el ID del lead generado desde la respuesta
      if (!leadResponse.success || !leadResponse.data?.id) {
        throw new Error(leadResponse.message || "Error al crear los datos base del prospecto.");
      }
      const newLeadId = leadResponse.data.id;

      // Paso 3: Invoca inmediatamente addLeadToCampaign
      const memberPayload = {
        lead_id: newLeadId,
        campaing_id: selectedCampaignId, // Mantener el typo 'campaing_id' requerido por la DB
        assigned_to: sellerId,
        source: "WHATSAPP",
        is_primary: true
      };

      const memberResponse = (await addLeadToCampaign(selectedCampaignId, memberPayload as any, sellerId)) as any;
      if (!memberResponse.success) {
        throw new Error(memberResponse.message || "Error al asociar el prospecto a la campaña.");
      }

      return memberResponse;
    },
    onSuccess: () => {
      toast.success("Prospecto registrado y asignado exitosamente.");
      // 4. REFRESCAR EL KANBAN DE FORMA OPTIMISTA
      queryClient.invalidateQueries({ queryKey: ["campaign-members-seller", selectedCampaignId, sellerId] });
      setIsOpenNewLeadModal(false);
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.message || "Ocurrió un error al registrar el prospecto.");
    }
  });

  const handleStatusChange = (memberId: string, newStatus: string) => {
    const backendStatus = KANBAN_STAGE_TO_ENUM[newStatus] || newStatus;
    updateStatusMutation.mutate({ memberId, status: backendStatus });
  };

  const handleCampaignChange = (val: string) => {
    setSearchParams({ campaignId: val });
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
      NUEVO: [],
      CONTACTADO: [],
      NO_CONTACTADO: [],
      PREVENTA_CITA: [],
      MATRICULADO: [],
      DESCARTADO: []
    };

    filteredLeads.forEach((lead: any) => {
      const status = lead.lead_status || "NEW";
      const mappedStage = ENUM_TO_KANBAN_STAGE[status] || "NUEVO";
      if (groups[mappedStage]) {
        groups[mappedStage].push(lead);
      } else {
        groups["NUEVO"].push(lead);
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
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2 h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
              title="Retroceder"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <UserCheck className="text-primary h-6 w-6" /> Funnel de Tipificación
            </h1>
          </div>
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
            onClick={() => setIsOpenNewLeadModal(true)}
            className="h-9 gap-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center border border-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Nuevo Lead
          </Button>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 w-full animate-pulse">
          {FUNNEL_COLUMNS.map((stage) => (
            <div key={stage.id} className="rounded-2xl border border-border p-4 bg-slate-50/20 space-y-4 h-[70vh]">
              <Skeleton className="h-6 w-2/3 mb-4 animate-none" />
              <Skeleton className="h-24 w-full rounded-xl animate-none" />
              <Skeleton className="h-24 w-full rounded-xl animate-none" />
            </div>
          ))}
        </div>
      ) : isErrorLeads ? (
        <div className="rounded-2xl border border-dashed border-destructive/30 p-12 text-center text-destructive bg-destructive/5">
          <p className="font-bold">Error al conectar con el servidor para obtener los miembros de la campaña.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start w-full">
          {FUNNEL_COLUMNS.map((stage) => {
            const laneLeads = leadsByStage[stage.id] || [];
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                leads={laneLeads}
                onSelect={setSelectedLead}
                onStatusChange={handleStatusChange}
                isPending={updateStatusMutation.isPending}
              />
            );
          })}
        </div>
      )}

      {/* Lateral Sheet of Details */}
      <LeadDetailsSheet
        selectedLead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
        isStatusPending={updateStatusMutation.isPending}
        setSelectedLead={setSelectedLead}
        interactions={interactions}
        isLoadingInteractions={isLoadingInteractions}
        createInteractionMutation={createInteractionMutation}
        tasks={tasks}
        isLoadingTasks={isLoadingTasks}
        createTaskMutation={createTaskMutation}
        updateTaskMutation={updateTaskMutation}
        deleteTaskMutation={deleteTaskMutation}
        selectedCampaignId={selectedCampaignId}
      />

      {/* Modal de Registro Manual de Lead */}
      <NewLeadModal
        isOpen={isOpenNewLeadModal}
        onClose={() => setIsOpenNewLeadModal(false)}
        onSubmit={createManualLeadMutation.mutateAsync}
        isSubmitting={createManualLeadMutation.isPending}
      />
    </div>
  );
};

export default SellerLeadsView;
