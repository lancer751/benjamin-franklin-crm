import { useState, useMemo } from "react";
import { BookOpen, Calendar, ChevronLeft, ChevronRight, Loader2, Phone, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CAMPAIGN_MEMBER_STATUS_CONFIG,
  CAMPAIGN_MEMBER_STATUS_OPTIONS,
  getCampaignMemberStatusLabel,
  isCampaignMemberStatus,
  type CampaignMemberStatus,
} from "@/core/constants/campaignMemberStatus";
import { getCampaignMembers, type CampaignMembersQueryReq } from "@/features/campaigns/services/campaignService";
import type { AdvisorFilterOption } from "@/features/leads/adapters/campaignAssignmentAdapter";
import { adaptTeamFollowUpMemberPage, type TeamFollowUpMemberRow } from "@/features/leads/adapters/teamFollowUpAdapter";
import type { NormalizedLead } from "@/features/leads/adapters/leadAdapter";
import { canReassignCampaignMembers, mapCampaignMemberReassignmentError } from "@/features/leads/utils/campaignMemberReassignment";
import { useSupervisorMemberDrawer } from "@/features/leads/hooks/useSupervisorMemberDrawer";
import { useCampaignMemberReassignment } from "@/features/leads/hooks/useCampaignMemberReassignment";
import { CampaignMemberReassignmentDialog } from "@/features/leads/components/CampaignMemberReassignmentDialog";
import LeadDetailsSheet from "@/features/campaigns/views/seller/components/LeadDetailsSheet";

const PAGE_SIZE = 20;

const formatDateTime = (value: string): string => {
  if (!value) return "No disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const MemberStatusBadge = ({ status }: { status: string }) => {
  const config = isCampaignMemberStatus(status) ? CAMPAIGN_MEMBER_STATUS_CONFIG[status] : null;
  return (
    <Badge variant="outline" className={config?.badgeClassName}>
      {getCampaignMemberStatusLabel(status, "No disponible")}
    </Badge>
  );
};

interface PaginationProps {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, isFetching, onPageChange }: PaginationProps) => (
  <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
    <span>Página {page} de {totalPages}</span>
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="sm" disabled={page <= 1 || isFetching} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" /> Anterior
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={page >= totalPages || isFetching} onClick={() => onPageChange(page + 1)}>
        Siguiente <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export interface CampaignMembersPanelProps {
  campaignId: string;
  campaignName?: string;
  sellers?: AdvisorFilterOption[];
  variant?: "team-follow-up" | "campaign-detail";
  title?: string;
  initialAdvisorUserId?: string;
}

export const CampaignMembersPanel = ({
  campaignId,
  campaignName = "",
  sellers = [],
  variant = "campaign-detail",
  title,
  initialAdvisorUserId,
}: CampaignMembersPanelProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name ?? "";
  const isSalesRep = role === "SALES_REP";
  const authenticatedUserId = user?.id ?? "";
  const canReassign = canReassignCampaignMembers(role);

  const [campaignAdvisorUserId, setCampaignAdvisorUserId] = useState(initialAdvisorUserId ?? "ALL");
  const [campaignMemberStatus, setCampaignMemberStatus] = useState<CampaignMemberStatus | "ALL">("ALL");
  const [campaignPage, setCampaignPage] = useState(1);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamFollowUpMemberRow | null>(null);
  const [drawerLead, setDrawerLead] = useState<NormalizedLead | null>(null);
  const [reassignmentMembers, setReassignmentMembers] = useState<TeamFollowUpMemberRow[]>([]);

  const drawer = useSupervisorMemberDrawer(selectedMember);
  const reassignment = useCampaignMemberReassignment();

  const effectiveCampaignAdvisorId = isSalesRep
    ? authenticatedUserId
    : campaignAdvisorUserId !== "ALL"
      ? campaignAdvisorUserId
      : "";

  const memberQuery = useMemo<CampaignMembersQueryReq>(() => ({
    page: String(campaignPage),
    limit: String(PAGE_SIZE),
    ...(effectiveCampaignAdvisorId && { assigned_to: effectiveCampaignAdvisorId }),
    ...(campaignMemberStatus !== "ALL" && { campaign_member_status: campaignMemberStatus }),
  }), [campaignMemberStatus, campaignPage, effectiveCampaignAdvisorId]);

  const membersQuery = useQuery({
    queryKey: [
      "team-follow-up",
      "campaign-members",
      campaignId || "no-campaign",
      effectiveCampaignAdvisorId || "all-advisors",
      campaignMemberStatus,
      campaignPage,
      PAGE_SIZE,
    ],
    queryFn: () => getCampaignMembers(campaignId, memberQuery),
    enabled: Boolean(user) && Boolean(campaignId),
    placeholderData: keepPreviousData,
  });

  const memberPageData = useMemo(
    () => adaptTeamFollowUpMemberPage(
      membersQuery.data,
      campaignId,
      campaignName,
    ),
    [membersQuery.data, campaignName, campaignId],
  );

  const memberTotalPages = Math.max(1, Math.ceil(memberPageData.total / Math.max(1, memberPageData.limit)));
  const memberRows = memberPageData.members;

  const selectedMembers = memberRows.filter((member) => selectedMemberIds.includes(member.memberId));
  const areAllVisibleMembersSelected = memberRows.length > 0 && memberRows.every((member) => selectedMemberIds.includes(member.memberId));
  const hasPartialSelection = selectedMemberIds.length > 0 && !areAllVisibleMembersSelected;
  const hasActiveFilters = campaignAdvisorUserId !== "ALL" || campaignMemberStatus !== "ALL";

  const handleCampaignAdvisorChange = (advisorUserId: string) => {
    setCampaignAdvisorUserId(advisorUserId);
    setCampaignPage(1);
    setSelectedMemberIds([]);
  };

  const handleCampaignStatusChange = (status: string) => {
    if (status === "ALL" || isCampaignMemberStatus(status)) {
      setCampaignMemberStatus(status as CampaignMemberStatus | "ALL");
      setCampaignPage(1);
      setSelectedMemberIds([]);
    }
  };

  const handlePageChange = (page: number) => {
    setCampaignPage(page);
    setSelectedMemberIds([]);
  };

  const toggleMemberSelection = (memberId: string, checked: boolean) => {
    setSelectedMemberIds((current) => checked
      ? Array.from(new Set([...current, memberId]))
      : current.filter((id) => id !== memberId));
  };

  const toggleVisibleSelection = (checked: boolean) => {
    setSelectedMemberIds(checked ? memberRows.map((member) => member.memberId) : []);
  };

  const openMemberDrawer = (member: TeamFollowUpMemberRow) => {
    setSelectedMember(member);
    setDrawerLead(member.drawerLead);
  };

  const closeMemberDrawer = () => {
    setSelectedMember(null);
    setDrawerLead(null);
  };

  const openBulkReassignment = () => {
    if (!campaignId || selectedMembers.length === 0 || selectedMembers.some((member) => member.campaignId !== campaignId)) {
      toast.error("Solo puedes reasignar prospectos de una misma campaña.");
      return;
    }
    setReassignmentMembers(selectedMembers);
  };

  const confirmReassignment = (advisor: AdvisorFilterOption) => {
    const [firstMember] = reassignmentMembers;
    if (!firstMember || !campaignId) return;
    const onSuccess = () => {
      const count = reassignmentMembers.length;
      toast.success(count === 1
        ? `${firstMember.prospectName} fue reasignado a ${advisor.name}.`
        : `${count} prospectos fueron reasignados a ${advisor.name}.`);
      setSelectedMemberIds([]);
      setReassignmentMembers([]);
    };
    const onError = (error: unknown) => toast.error(mapCampaignMemberReassignmentError(error));

    if (reassignmentMembers.length === 1) {
      reassignment.reassignOne.mutate({
        campaignId: firstMember.campaignId || campaignId,
        memberId: firstMember.memberId,
        assignedTo: advisor.userId,
      }, { onSuccess, onError });
      return;
    }
    reassignment.reassignMany.mutate({
      campaignId,
      memberIds: reassignmentMembers.map((member) => member.memberId),
      assignedTo: advisor.userId,
    }, { onSuccess, onError });
  };

  const sectionTitle = title ?? (variant === "campaign-detail" ? "Leads / Prospectos de la Campaña" : (campaignName || "Por campaña"));

  return (
    <div className="space-y-0">
      <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">{sectionTitle}</h2>
          <p className="text-xs text-muted-foreground">
            {!campaignId
              ? "Selecciona una campaña para consultar sus prospectos."
              : `${memberPageData.total} prospecto${memberPageData.total === 1 ? "" : "s"} asociado${memberPageData.total === 1 ? "" : "s"} según el backend.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {membersQuery.isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Actualizando" />}
          {variant === "campaign-detail" && campaignId && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const returnTo = encodeURIComponent(`/campanas/${campaignId}`);
                navigate(`/prospectos/nuevo?campaignId=${encodeURIComponent(campaignId)}&returnTo=${returnTo}`);
              }}
              aria-label="Registrar nuevo prospecto en esta campaña"
              className="gap-1.5 font-semibold"
            >
              <Plus size={16} />
              Nuevo prospecto
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b bg-slate-50/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Buscar prospecto</label>
          <Input disabled placeholder="No disponible en este endpoint" className="bg-white" />
          <p className="text-[10px] text-muted-foreground">La API de miembros no admite búsqueda.</p>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Asesor</label>
          <Select value={campaignAdvisorUserId} onValueChange={handleCampaignAdvisorChange} disabled={!campaignId || sellers.length === 0 || isSalesRep}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Todos los asesores" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los asesores</SelectItem>
              {sellers.map((advisor) => <SelectItem key={advisor.userId} value={advisor.userId}>{advisor.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tipificación</label>
          <Select value={campaignMemberStatus} onValueChange={handleCampaignStatusChange} disabled={!campaignId}>
            <SelectTrigger className="bg-white"><SelectValue placeholder="Todas las tipificaciones" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las tipificaciones</SelectItem>
              {CAMPAIGN_MEMBER_STATUS_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rango de fecha</label>
          <Select disabled><SelectTrigger className="bg-white"><SelectValue placeholder="No disponible" /></SelectTrigger></Select>
          <p className="text-[10px] text-muted-foreground">La API de miembros no admite fechas.</p>
        </div>
      </div>

      {!campaignId ? (
        <div className="px-4 py-16 text-center text-sm text-muted-foreground">Selecciona una campaña para consultar sus prospectos.</div>
      ) : membersQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Cargando prospectos de la campaña…</div>
      ) : membersQuery.isError ? (
        <div className="space-y-3 px-4 py-16 text-center"><p className="text-sm text-rose-700">No fue posible consultar los prospectos de esta campaña.</p><Button type="button" variant="outline" onClick={() => membersQuery.refetch()}>Reintentar</Button></div>
      ) : (
        <>
          {canReassign && selectedMemberIds.length > 0 && (
            <div className="flex flex-col gap-3 border-b bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium">{selectedMemberIds.length} prospecto{selectedMemberIds.length === 1 ? "" : "s"} seleccionado{selectedMemberIds.length === 1 ? "" : "s"}</span>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={openBulkReassignment}>Reasignar asesor</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setSelectedMemberIds([])}>Limpiar selección</Button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                {canReassign && <TableHead className="w-12"><Checkbox aria-label="Seleccionar prospectos visibles" checked={areAllVisibleMembersSelected ? true : hasPartialSelection ? "indeterminate" : false} onCheckedChange={(checked) => toggleVisibleSelection(checked === true)} /></TableHead>}
                <TableHead><span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Fecha/hora de asociación</span></TableHead>
                <TableHead><span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />Curso o programa</span></TableHead>
                <TableHead><span className="flex items-center gap-1"><Phone className="h-4 w-4" />Celular principal</span></TableHead>
                <TableHead>Prospecto</TableHead><TableHead>Tipificación</TableHead><TableHead>Asesor actual</TableHead>{canReassign && <TableHead>Acciones</TableHead>}
              </TableRow></TableHeader>
              <TableBody>
                {memberRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canReassign ? 8 : 6} className="py-12 text-center text-muted-foreground">
                      {hasActiveFilters ? "No se encontraron prospectos con los filtros actuales." : "No hay prospectos asociados a esta campaña."}
                    </TableCell>
                  </TableRow>
                ) : memberRows.map((member) => (
                  <TableRow
                    key={member.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver gestión de ${member.prospectName} en ${member.programName}`}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    onClick={() => openMemberDrawer(member)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openMemberDrawer(member);
                      }
                    }}
                  >
                    {canReassign && <TableCell onClick={(event) => event.stopPropagation()}><Checkbox aria-label={`Seleccionar ${member.prospectName}`} checked={selectedMemberIds.includes(member.memberId)} onCheckedChange={(checked) => toggleMemberSelection(member.memberId, checked === true)} /></TableCell>}
                    <TableCell>{formatDateTime(member.associatedAt)}</TableCell><TableCell className="font-medium">{member.programName}</TableCell><TableCell>{member.phone}</TableCell><TableCell>{member.prospectName}</TableCell><TableCell><MemberStatusBadge status={member.memberStatus} /></TableCell><TableCell>{member.advisorName || "No disponible"}</TableCell>
                    {canReassign && <TableCell onClick={(event) => event.stopPropagation()}><Button type="button" size="sm" variant="outline" onClick={() => setReassignmentMembers([member])}>Reasignar asesor</Button></TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={campaignPage} totalPages={memberTotalPages} isFetching={membersQuery.isFetching} onPageChange={handlePageChange} />
        </>
      )}

      <LeadDetailsSheet
        selectedLead={drawerLead}
        setSelectedLead={setDrawerLead}
        onClose={closeMemberDrawer}
        onStatusChange={drawer.changeStatus}
        isStatusPending={drawer.statusMutation.isPending}
        interactions={drawer.interactions}
        isLoadingInteractions={drawer.interactionsQuery.isLoading}
        isErrorInteractions={drawer.interactionsQuery.isError}
        onRetryInteractions={() => void drawer.interactionsQuery.refetch()}
        createInteractionMutation={drawer.createInteractionMutation}
        tasks={drawer.tasks}
        isLoadingTasks={drawer.tasksQuery.isLoading}
        isErrorTasks={drawer.tasksQuery.isError}
        onRetryTasks={() => void drawer.tasksQuery.refetch()}
        createTaskMutation={drawer.createTaskMutation}
        updateTaskMutation={drawer.updateTaskMutation}
        deleteTaskMutation={drawer.deleteTaskMutation}
        selectedCampaignId={selectedMember?.campaignId ?? ""}
        interactionCount={selectedMember?.interactionCount}
        capabilities={{ ...drawer.capabilities, canEditLead: false }}
      />
      <CampaignMemberReassignmentDialog
        open={reassignmentMembers.length > 0}
        members={reassignmentMembers}
        campaignName={campaignName || "Campaña"}
        advisors={sellers}
        isPending={reassignment.reassignOne.isPending || reassignment.reassignMany.isPending}
        onOpenChange={(open) => {
          if (!open && !reassignment.reassignOne.isPending && !reassignment.reassignMany.isPending) {
            setReassignmentMembers([]);
          }
        }}
        onConfirm={confirmReassignment}
      />
    </div>
  );
};

export default CampaignMembersPanel;
