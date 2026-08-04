import { ArrowLeft, BookOpen, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Layers, Loader2, Phone, TrendingUp, Users, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import {
  CAMPAIGN_MEMBER_STATUS_CONFIG,
  CAMPAIGN_MEMBER_STATUS_OPTIONS,
  getCampaignMemberStatusLabel,
  isCampaignMemberStatus,
} from "@/core/constants/campaignMemberStatus";
import { LEAD_STATUS_OPTIONS, getLeadStatusLabel, isLeadStatus } from "../utils/prospectDisplay";
import { useSupervisorFollowUp, type TeamFollowUpMode } from "../hooks/useSupervisorFollowUp";

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

const SupervisorFollowUpView = () => {
  const navigate = useNavigate();
  const followUp = useSupervisorFollowUp();
  const isCampaignMode = followUp.mode === "CAMPAIGN";

  const handleModeChange = (value: string) => {
    if (value === "ALL" || value === "UNASSIGNED" || value === "CAMPAIGN") {
      followUp.selectMode(value as TeamFollowUpMode);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100" aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seguimiento de Equipo de Ventas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Supervisa los prospectos generales y la gestión comercial dentro de cada campaña.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asesores activos</CardTitle>
            <Users size={16} className="text-sky-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{followUp.isLoadingSellers ? "…" : followUp.isErrorSellers ? "No disponible" : followUp.kpis.activeSellers}</div></CardContent>
        </Card>
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conversión del equipo</CardTitle>
            <TrendingUp size={16} className="text-emerald-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">No disponible</div></CardContent>
        </Card>
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ventas realizadas</CardTitle>
            <Layers size={16} className="text-amber-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{followUp.isLoadingSellers ? "…" : followUp.isErrorSellers ? "No disponible" : Math.trunc(followUp.kpis.totalSales).toLocaleString("es-PE")}</div></CardContent>
        </Card>
        <Card className="rounded-xl border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Órdenes acumuladas</CardTitle>
            <div className="flex gap-1"><CheckCircle2 size={14} className="text-emerald-600" /><XCircle size={14} className="text-rose-600" /></div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{followUp.isLoadingSellers ? "…" : followUp.isErrorSellers ? "No disponible" : `${followUp.kpis.completedOrders} / ${followUp.kpis.cancelledOrders}`}</div></CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-xl border-border/60 bg-white shadow-sm">
        <Tabs value={followUp.mode} onValueChange={handleModeChange}>
          <div className="flex flex-col gap-4 border-b bg-slate-50 p-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Control de asignación y seguimiento</span>
              <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-slate-200/60 p-1 sm:grid-cols-3 lg:w-auto">
                <TabsTrigger value="ALL" className="px-4 py-2 text-xs font-semibold uppercase">Todos los leads</TabsTrigger>
                <TabsTrigger value="UNASSIGNED" className="px-4 py-2 text-xs font-semibold uppercase">Sin asignar</TabsTrigger>
                <TabsTrigger value="CAMPAIGN" className="px-4 py-2 text-xs font-semibold uppercase">Por campaña</TabsTrigger>
              </TabsList>
            </div>

            {isCampaignMode && (
              <div className="w-full space-y-1 lg:w-[320px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Seleccionar campaña</label>
                <Select value={followUp.selectedCampaignId || undefined} onValueChange={followUp.selectCampaign} disabled={followUp.isLoadingCampaigns || followUp.isErrorCampaigns || followUp.campaigns.length === 0}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder={followUp.isLoadingCampaigns ? "Cargando campañas…" : "Selecciona una campaña"} /></SelectTrigger>
                  <SelectContent>
                    {followUp.campaigns.map((campaign) => <SelectItem key={campaign.id} value={campaign.id}>{campaign.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {followUp.isErrorCampaigns && <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={followUp.retryCampaigns}>Reintentar carga de campañas</Button>}
                {!followUp.isLoadingCampaigns && !followUp.isErrorCampaigns && followUp.campaigns.length === 0 && <p className="text-xs text-muted-foreground">No hay campañas activas disponibles.</p>}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                {followUp.mode === "ALL" ? "Todos los leads" : followUp.mode === "UNASSIGNED" ? "Leads sin asignar" : followUp.selectedCampaign?.name ?? "Por campaña"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isCampaignMode
                  ? followUp.selectedCampaign
                    ? `${followUp.memberTotal} prospectos asociados según el backend.`
                    : "Selecciona una campaña para consultar sus prospectos."
                  : `${followUp.leadTotal} prospectos encontrados.`}
              </p>
            </div>
            {(followUp.isFetchingLeads || followUp.isFetchingMembers) && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Actualizando" />}
          </div>

          {isCampaignMode ? (
            <>
              <div className="grid grid-cols-1 gap-3 border-b bg-slate-50/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Buscar prospecto</label>
                  <Input disabled placeholder="No disponible en este endpoint" className="bg-white" />
                  <p className="text-[10px] text-muted-foreground">La API de miembros no admite búsqueda.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Asesor</label>
                  <Select value={followUp.campaignAdvisorUserId} onValueChange={followUp.setCampaignAdvisorUserId} disabled={!followUp.selectedCampaign || followUp.campaignAdvisors.length === 0 || followUp.isSalesRep}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Todos los asesores" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los asesores</SelectItem>
                      {followUp.campaignAdvisors.map((advisor) => <SelectItem key={advisor.userId} value={advisor.userId}>{advisor.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tipificación</label>
                  <Select value={followUp.campaignMemberStatus} onValueChange={(value) => { if (value === "ALL" || isCampaignMemberStatus(value)) followUp.setCampaignMemberStatus(value); }} disabled={!followUp.selectedCampaign}>
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

              {!followUp.selectedCampaign ? (
                <div className="px-4 py-16 text-center text-sm text-muted-foreground">Selecciona una campaña para consultar sus prospectos.</div>
              ) : followUp.isLoadingMembers ? (
                <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Cargando prospectos de la campaña…</div>
              ) : followUp.isErrorMembers ? (
                <div className="space-y-3 px-4 py-16 text-center"><p className="text-sm text-rose-700">No fue posible consultar los prospectos de esta campaña.</p><Button type="button" variant="outline" onClick={() => followUp.retryMembers()}>Reintentar</Button></div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead><span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Fecha/hora de asociación</span></TableHead>
                        <TableHead><span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />Curso o programa</span></TableHead>
                        <TableHead><span className="flex items-center gap-1"><Phone className="h-4 w-4" />Celular principal</span></TableHead>
                        <TableHead>Prospecto</TableHead><TableHead>Tipificación</TableHead><TableHead>Asesor</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {followUp.memberRows.length === 0 ? <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No hay prospectos para los filtros seleccionados.</TableCell></TableRow> : followUp.memberRows.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>{formatDateTime(member.associatedAt)}</TableCell><TableCell className="font-medium">{member.programName}</TableCell><TableCell>{member.phone}</TableCell><TableCell>{member.prospectName}</TableCell><TableCell><MemberStatusBadge status={member.memberStatus} /></TableCell><TableCell>{member.advisorName}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination page={followUp.campaignPage} totalPages={followUp.memberTotalPages} isFetching={followUp.isFetchingMembers} onPageChange={followUp.setCampaignPage} />
                </>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 border-b bg-slate-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Buscar prospecto</label><Input value={followUp.leadSearch} onChange={(event) => followUp.setLeadSearch(event.target.value)} placeholder="Nombre, correo, DNI o celular" className="bg-white" /></div>
                <div className="space-y-1"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Estado del lead</label><Select value={followUp.leadStatus} onValueChange={(value) => { if (value === "ALL" || isLeadStatus(value)) followUp.setLeadStatus(value); }}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Todos los estados</SelectItem>{LEAD_STATUS_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Asesor</label><Select value={followUp.mode === "UNASSIGNED" ? "UNASSIGNED" : followUp.leadAdvisorUserId} onValueChange={followUp.setLeadAdvisorUserId} disabled={followUp.mode === "UNASSIGNED" || !followUp.canFilterByAdvisor}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent>{followUp.mode === "UNASSIGNED" ? <SelectItem value="UNASSIGNED">Sin asignar</SelectItem> : <><SelectItem value="ALL">Todos los asesores</SelectItem>{followUp.allAdvisors.map((advisor) => <SelectItem key={advisor.userId} value={advisor.userId}>{advisor.name}</SelectItem>)}</>}</SelectContent></Select></div>
              </div>

              {followUp.isLoadingLeads ? <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Cargando leads…</div> : followUp.isErrorLeads ? <div className="space-y-3 px-4 py-16 text-center"><p className="text-sm text-rose-700">No fue posible consultar los leads.</p><Button type="button" variant="outline" onClick={() => followUp.retryLeads()}>Reintentar</Button></div> : <>
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Registro</TableHead><TableHead>Prospecto</TableHead><TableHead>Correo</TableHead><TableHead>Celular</TableHead><TableHead>Estado general</TableHead><TableHead>Asesor</TableHead></TableRow></TableHeader><TableBody>
                  {followUp.leadRows.length === 0 ? <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No se encontraron leads.</TableCell></TableRow> : followUp.leadRows.map((lead) => <TableRow key={lead.id}><TableCell>{formatDateTime(lead.createdAt)}</TableCell><TableCell className="font-medium">{lead.fullName || "No disponible"}</TableCell><TableCell>{lead.email || "No disponible"}</TableCell><TableCell>{lead.phone || "No disponible"}</TableCell><TableCell>{getLeadStatusLabel(lead.leadStatus)}</TableCell><TableCell>{lead.sellerName || "No disponible"}</TableCell></TableRow>)}
                </TableBody></Table></div>
                <Pagination page={followUp.leadPage} totalPages={followUp.leadTotalPages} isFetching={followUp.isFetchingLeads} onPageChange={followUp.setLeadPage} />
              </>}
            </>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default SupervisorFollowUpView;
