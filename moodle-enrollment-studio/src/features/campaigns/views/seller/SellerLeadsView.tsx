import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getSellerCampaigns } from "@/features/users/services/userService";
import { 
  getCampaignMembers, 
  updateMemberStatus,
  getMemberInteractions,
  createMemberInteraction,
  getMemberTasks,
  createMemberTask,
  updateMemberTask,
  deleteMemberTask,
} from "@/features/leads/services/leadService";
import { adaptCampaignMembers, unpackLeads } from "@/features/leads/adapters/leadAdapter";
import { requireSuccess } from "@/features/leads/adapters/leadDetailAdapter";
import { adaptLeadInteraction, adaptLeadInteractionsResponse } from "@/features/leads/adapters/leadInteractionAdapter";
import { useManualLeadRegistration } from "@/features/leads/hooks/useManualLeadRegistration";
import type { ManualLeadData } from "@/features/leads/schemas/manualLeadSchema";
import { getApiErrorMessage } from "@/features/leads/utils/getApiErrorMessage";
import { mapInteractionFormToPayload, mapTaskFormToPayload } from "@/features/leads/utils/leadActionPayloadMappers";
import { Button } from "@/core/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Input } from "@/core/components/ui/input";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/core/lib/utils";
import {
  CAMPAIGN_MEMBER_STATUS_LIST,
  CAMPAIGN_MEMBER_STATUS_GROUPS,
  isCampaignMemberStatus,
  type CampaignMemberStatus,
  type CampaignMemberStatusGroup,
} from "@/core/constants/campaignMemberStatus";
import type { NormalizedLead } from "@/features/leads/adapters/leadAdapter";
import { 
  Users, 
  Search, 
  RefreshCw,
  UserCheck,
  Plus,
  ArrowLeft,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import KanbanColumn from "./components/KanbanColumn";
import LeadDetailsSheet from "./components/LeadDetailsSheet";
import NewLeadModal from "./components/NewLeadModal";
import {
  CampaignKanbanDndProvider,
  DroppableKanbanColumn,
  type CampaignKanbanMovePayload,
} from "@/features/campaigns/components/kanban-dnd";

interface AssignedCampaign {
  id: string;
  name: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeAssignedCampaigns = (response: unknown): AssignedCampaign[] => {
  if (!isRecord(response)) return [];
  const data = isRecord(response.data) ? response.data : null;
  const rawList = data?.assignedCampaing ?? response.assignedCampaing;
  if (!Array.isArray(rawList)) return [];

  return rawList.flatMap((item): AssignedCampaign[] => {
    if (!isRecord(item)) return [];
    const nested = isRecord(item.campaing)
      ? item.campaing
      : isRecord(item.campaign)
        ? item.campaign
        : item;
    return typeof nested.id === "string" && typeof nested.name === "string"
      ? [{ id: nested.id, name: nested.name }]
      : [];
  });
};

const getPhone = (lead: NormalizedLead) => lead.phones?.[0]?.number || null;

const STATUS_GROUP_ORDER = Array.from(
  new Set(CAMPAIGN_MEMBER_STATUS_LIST.map((status) => status.group)),
) as CampaignMemberStatusGroup[];

const SellerLeadsView = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  // 🛡️ CORRECCIÓN DE IDs
  const sellerProfileId = user?.seller?.id;
  const creatorUserId = user?.id;

  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();
  const selectedCampaignId = campaignId || searchParams.get("campaignId") || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignMemberStatus | "ALL">("ALL");
  const [activeStage, setActiveStage] = useState<CampaignMemberStatus>("NUEVO");
  const [hasMoreColumns, setHasMoreColumns] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);

  const [selectedLead, setSelectedLead] = useState<NormalizedLead | null>(null);

  const selectedMemberId = useMemo(() => {
    return selectedLead?.campaignsEngaging?.[0]?.id || selectedLead?.id || "";
  }, [selectedLead]);

  // 1. Obtener campañas asignadas con el ID del perfil vendedor.
  const { data: sellerCampaignsRes, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["seller-assigned-campaigns", sellerProfileId],
    queryFn: () => {
      if (!sellerProfileId) throw new Error("Seller profile ID is required");
      return getSellerCampaigns(sellerProfileId);
    },
    enabled: Boolean(sellerProfileId),
  });

  const assignedCampaignList = useMemo(() => {
    return normalizeAssignedCampaigns(sellerCampaignsRes);
  }, [sellerCampaignsRes]);

  // Preseleccionar la primera campaña si no hay seleccionada
  useEffect(() => {
    if (assignedCampaignList.length > 0 && !selectedCampaignId) {
      navigate(`/admin/campaigns/seller/leads/${assignedCampaignList[0].id}`, { replace: true });
    }
  }, [assignedCampaignList, selectedCampaignId, navigate]);

  // 2. Obtener los leads asignados al User.id autenticado.
  const { data: membersRes, isLoading: isLoadingLeads, isError: isErrorLeads } = useQuery({
    queryKey: ["campaign-members-seller", selectedCampaignId, creatorUserId],
    queryFn: () => getCampaignMembers(selectedCampaignId, { assigned_to: creatorUserId }),
    enabled: !!selectedCampaignId && !!creatorUserId,
  });

  const leads = useMemo(() => {
    const rawData = unpackLeads(membersRes);
    return adaptCampaignMembers(rawData);
  }, [membersRes]);

  // 3. Consultas e interacciones
  const { data: interactionsRes, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ["member-interactions", selectedCampaignId, selectedMemberId],
    queryFn: () => getMemberInteractions(selectedCampaignId, selectedMemberId),
    enabled: !!selectedCampaignId && !!selectedMemberId,
  });

  const interactions = useMemo(() => {
    return adaptLeadInteractionsResponse(interactionsRes);
  }, [interactionsRes]);

  // 4. Consultas de tareas
  const { data: tasksRes, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["member-tasks", selectedCampaignId, selectedMemberId],
    queryFn: () => getMemberTasks(selectedCampaignId, selectedMemberId),
    enabled: !!selectedCampaignId && !!selectedMemberId,
  });

  const tasks = useMemo(() => {
    return tasksRes?.data || (Array.isArray(tasksRes) ? tasksRes : []);
  }, [tasksRes]);

  // Mutación para registrar interacciones
  const createInteractionMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof mapInteractionFormToPayload>) => {
      const response = await createMemberInteraction(
        selectedCampaignId,
        selectedMemberId,
        payload.notes,
        payload.type,
        creatorUserId || ""
      );
      requireSuccess(response, "No se pudo registrar la gestión. Inténtalo nuevamente.");
      return adaptLeadInteraction(response);
    },
    onSuccess: () => {
      toast.success("Interacción registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["member-interactions", selectedCampaignId, selectedMemberId] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo registrar la gestión. Inténtalo nuevamente."));
    }
  });

  // Mutación para crear tareas
  const createTaskMutation = useMutation({
    mutationFn: async (payload: ReturnType<typeof mapTaskFormToPayload>) => {
      if (!creatorUserId) {
        throw new Error("Error: No se identificó al usuario autenticado.");
      }
      const response = await createMemberTask(
        selectedCampaignId,
        selectedMemberId,
        {
          title: payload.title,
          content: payload.content,
          is_done: payload.is_done,
          due_date: payload.due_date,
        },
        creatorUserId,
      );
      requireSuccess(response, "No se pudo crear la tarea. Inténtalo nuevamente.");
      return response;
    },
    onSuccess: () => {
      toast.success("Tarea registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["member-tasks", selectedCampaignId, selectedMemberId] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "No se pudo crear la tarea. Inténtalo nuevamente."));
    }
  });

  // Mutación para marcar la tarea como completada
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Parameters<typeof updateMemberTask>[3] }) =>
      updateMemberTask(selectedCampaignId, selectedMemberId, taskId, payload),
    onSuccess: () => {
      toast.success("Tarea actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: ["member-tasks", selectedCampaignId, selectedMemberId] });
    },
    onError: () => {
      toast.error("Error al actualizar la tarea");
    }
  });

  // Mutación para eliminar tareas
  const deleteTaskMutation = useMutation({
    mutationFn: ({ campaignId, memberId, taskId }: { campaignId: string; memberId: string; taskId: string }) =>
      deleteMemberTask(campaignId, memberId, taskId),
    onSuccess: () => {
      toast.success("Tarea registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ["member-tasks", selectedCampaignId, selectedMemberId] });
    },
    onError: () => {
      toast.error("Error al eliminar la tarea");
    }
  });

  // Mutación para actualizar la tipificación (status)
  const updateStatusMutation = useMutation({
    mutationFn: ({ memberId, status }: { memberId: string; status: CampaignMemberStatus }) =>
      updateMemberStatus(selectedCampaignId, memberId, status),
    onSuccess: () => {
      toast.success("Tipificación de lead actualizada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["campaign-members-seller", selectedCampaignId, creatorUserId] });
      queryClient.invalidateQueries({ queryKey: ["campaign-members", selectedCampaignId] });
    },
    onError: () => {
      toast.error("Ocurrió un error al actualizar el estado del lead.");
    }
  });

  const [isOpenNewLeadModal, setIsOpenNewLeadModal] = useState(false);

  const manualLeadRegistration = useManualLeadRegistration(
    selectedCampaignId,
    sellerProfileId,
    creatorUserId,
  );

  const handleManualLeadSubmit = async (data: ManualLeadData) => {
    try {
      const result = await manualLeadRegistration.mutateAsync(data);
      toast.success(
        result.mode === "linked"
          ? "Prospecto existente añadido a la campaña."
          : "Prospecto registrado y asignado exitosamente.",
      );
      setIsOpenNewLeadModal(false);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Ocurrió un error al registrar el prospecto.";
      toast.error(message);
      throw error;
    }
  };

  const handleStatusChange = (memberId: string, newStatus: CampaignMemberStatus) => {
    updateStatusMutation.mutate({ memberId, status: newStatus });
  };

  const handleKanbanMove = ({
    memberId,
    currentStage,
    targetStage,
  }: CampaignKanbanMovePayload) => {
    if (
      updateStatusMutation.isPending ||
      currentStage === targetStage ||
      !isCampaignMemberStatus(targetStage)
    ) {
      return;
    }

    handleStatusChange(memberId, targetStage);
  };

  const handleCampaignChange = (val: string) => {
    setSelectedLead(null);
    setStatusFilter("ALL");
    setActiveStage("NUEVO");
    setHasMoreColumns(true);
    setSearchQuery("");
    navigate(`/admin/campaigns/seller/leads/${val}`);
  };

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter((lead) => {
      if (statusFilter !== "ALL" && lead.lead_status !== statusFilter) return false;
      const fullName = lead.fullName.toLowerCase();
      const email = lead.email.toLowerCase();
      const phone = (getPhone(lead) || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [leads, searchQuery, statusFilter]);

  const leadsByStage = useMemo(() => {
    const groups = Object.fromEntries(
      CAMPAIGN_MEMBER_STATUS_LIST.map(({ value }) => [value, [] as NormalizedLead[]]),
    ) as Record<CampaignMemberStatus, NormalizedLead[]>;

    filteredLeads.forEach((lead) => {
      if (isCampaignMemberStatus(lead.lead_status)) {
        groups[lead.lead_status].push(lead);
      }
    });

    return groups;
  }, [filteredLeads]);

  const selectedCampaignName = useMemo(() => {
    return assignedCampaignList.find((campaign) => campaign.id === selectedCampaignId)?.name || "Campaña";
  }, [assignedCampaignList, selectedCampaignId]);

  const unsupportedStatusCount = useMemo(
    () => filteredLeads.filter((lead) => !isCampaignMemberStatus(lead.lead_status)).length,
    [filteredLeads],
  );

  const scrollToStage = (status: CampaignMemberStatus) => {
    setActiveStage(status);
    const target = boardRef.current?.querySelector<HTMLElement>(`[data-funnel-stage="${status}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const handleBoardScroll = () => {
    const board = boardRef.current;
    if (!board || window.innerWidth < 768) return;
    setHasMoreColumns(board.scrollLeft + board.clientWidth < board.scrollWidth - 4);
    const boardLeft = board.getBoundingClientRect().left;
    const stages = Array.from(board.querySelectorAll<HTMLElement>("[data-funnel-stage]"));
    const nearest = stages.reduce<HTMLElement | null>((current, stage) => {
      if (!current) return stage;
      return Math.abs(stage.getBoundingClientRect().left - boardLeft) < Math.abs(current.getBoundingClientRect().left - boardLeft)
        ? stage
        : current;
    }, null);
    const status = nearest?.dataset.funnelStage;
    if (isCampaignMemberStatus(status)) setActiveStage(status);
  };

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <div className="min-w-[200px] flex-1 md:flex-none">
            <Select value={selectedCampaignId} onValueChange={handleCampaignChange}>
              <SelectTrigger className="w-full h-9 bg-card rounded-xl border-border shadow-sm">
                <SelectValue placeholder="Seleccionar campaña" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCampaigns ? (
                  <SelectItem value="loading" disabled>Cargando campañas...</SelectItem>
                ) : assignedCampaignList.length === 0 ? (
                  <SelectItem value="empty" disabled>Sin campañas asignadas</SelectItem>
                ) : (
                  assignedCampaignList.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
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

      <div className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o celular..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-9 rounded-xl border-border bg-slate-50/20 pl-9 text-xs focus:bg-card"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 rounded-xl text-xs">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtros
                {statusFilter !== "ALL" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-3">
              <div>
                <p className="text-sm font-semibold">Filtrar funnel</p>
                <p className="text-xs text-muted-foreground">Aplica el filtro a todas las etapas.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Estado</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    if (value === "ALL") {
                      setStatusFilter("ALL");
                    } else if (isCampaignMemberStatus(value)) {
                      setStatusFilter(value);
                      scrollToStage(value);
                    }
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los estados</SelectItem>
                    {CAMPAIGN_MEMBER_STATUS_LIST.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {statusFilter !== "ALL" && (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setStatusFilter("ALL")}>Limpiar filtro</Button>
              )}
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:ml-auto">
            <Users size={14} className="text-primary/70" />
            En pantalla: <span className="font-extrabold text-foreground">{filteredLeads.length - unsupportedStatusCount}</span>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Navegación rápida por estados">
          {STATUS_GROUP_ORDER.map((group) => (
            <div key={group} className="flex shrink-0 items-center gap-1 rounded-lg border border-border/70 bg-muted/20 p-1">
              <span className="px-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {CAMPAIGN_MEMBER_STATUS_GROUPS[group]}
              </span>
              {CAMPAIGN_MEMBER_STATUS_LIST.filter((status) => status.group === group).map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => scrollToStage(status.value)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-semibold transition-colors",
                    activeStage === status.value
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  )}
                >
                  {status.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {unsupportedStatusCount > 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {unsupportedStatusCount} prospecto(s) tienen un estado fuera del catálogo actual y no se muestran en columnas.
        </p>
      )}

      {isLoadingLeads ? (
        <div className="grid animate-pulse grid-cols-1 gap-3 overflow-hidden md:grid-flow-col md:auto-cols-[minmax(285px,315px)] md:grid-cols-none">
          {CAMPAIGN_MEMBER_STATUS_LIST.slice(0, 4).map((stage) => (
            <div key={stage.value} className="h-[68vh] min-h-[480px] space-y-4 rounded-2xl border border-border bg-slate-50/20 p-4">
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
        <CampaignKanbanDndProvider
          disabled={updateStatusMutation.isPending}
          onMove={handleKanbanMove}
        >
          <div className="relative min-w-0 max-w-full overflow-hidden">
            <div
              ref={boardRef}
              onScroll={handleBoardScroll}
              className="max-w-full overflow-x-auto overscroll-x-contain pb-3 [scrollbar-gutter:stable] md:pr-10"
            >
              <div className="block md:grid md:w-max md:min-w-full md:grid-flow-col md:auto-cols-[minmax(285px,315px)] md:items-start md:gap-3">
                {CAMPAIGN_MEMBER_STATUS_LIST.map((stage, stageIndex) => {
                  const laneLeads = leadsByStage[stage.value];
                  const previousStage = CAMPAIGN_MEMBER_STATUS_LIST[stageIndex - 1];
                  const startsGroup = Boolean(previousStage && previousStage.group !== stage.group);
                  return (
                    <div
                      key={stage.value}
                      data-funnel-stage={stage.value}
                      className={cn(
                        activeStage === stage.value ? "block" : "hidden md:block",
                        startsGroup && "md:ml-1 md:border-l md:border-border md:pl-4",
                      )}
                    >
                      <DroppableKanbanColumn
                        stageId={stage.value}
                        disabled={updateStatusMutation.isPending}
                      >
                        <KanbanColumn
                          stage={stage}
                          leads={laneLeads}
                          onSelect={setSelectedLead}
                          onStatusChange={handleStatusChange}
                          isPending={updateStatusMutation.isPending}
                        />
                      </DroppableKanbanColumn>
                    </div>
                  );
                })}
              </div>
            </div>
            {hasMoreColumns && (
              <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-14 items-center justify-end bg-gradient-to-l from-background/90 to-transparent pr-1 md:flex">
                <span className="rounded-full border border-border bg-card p-1.5 text-muted-foreground shadow-sm" title="Hay más columnas hacia la derecha">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            )}
          </div>
        </CampaignKanbanDndProvider>
      )}

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

      <NewLeadModal
        isOpen={isOpenNewLeadModal}
        onClose={() => setIsOpenNewLeadModal(false)}
        onSubmit={handleManualLeadSubmit}
        isSubmitting={manualLeadRegistration.isPending}
        campaignId={selectedCampaignId}
        sellerProfileId={sellerProfileId}
      />
    </div>
  );
};

export default SellerLeadsView;
