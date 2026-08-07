import { ArrowLeft, ChevronLeft, ChevronRight, Filter, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { SellerTeamPanel } from "@/features/users/components/SellerTeamPanel";
import { LEAD_STATUS_OPTIONS, getLeadStatusLabel, isLeadStatus } from "../utils/prospectDisplay";
import { useSupervisorFollowUp, type TeamFollowUpMode } from "../hooks/useSupervisorFollowUp";
import { CampaignMembersPanel } from "@/features/campaigns/components/CampaignMembersPanel";

const formatDateTime = (value: string): string => {
  if (!value) return "No disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
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

  const handleCampaignChange = (campaignId: string) => {
    followUp.selectCampaign(campaignId);
  };

  // Compact summary metrics derived from sellerCards
  const activeSellersCount = followUp.sellerCards.filter((s) => s.isActive).length;
  const totalLeadsSum = followUp.sellerCards.reduce((acc, s) => acc + s.totalLeads, 0);
  const totalMatriculatedSum = followUp.sellerCards.reduce((acc, s) => acc + s.totalMatriculated, 0);
  const totalOrdersSum = followUp.sellerCards.reduce((acc, s) => acc + s.totalOrders, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 fade-in">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seguimiento de Equipo de Ventas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Supervisa la actividad de tus asesores comerciales y gestiona los prospectos por vendedor o campaña.
          </p>
        </div>
      </div>

      {/* ===== SECCIÓN COMPACTA: ASESORES DEL EQUIPO ===== */}
      <section aria-labelledby="team-section-title" className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-2">
          <div>
            <h2
              id="team-section-title"
              className="text-xs font-bold uppercase tracking-widest text-slate-500"
            >
              Asesores del equipo
            </h2>
          </div>

          {/* Compact horizontal summary strip */}
          {!followUp.isLoadingSellers && !followUp.isErrorSellers && followUp.sellerCards.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 rounded-lg bg-slate-100/70 px-3 py-1.5 text-xs text-slate-600">
              <div>
                Total asesores: <strong className="text-slate-800">{followUp.sellerCards.length}</strong>
              </div>
              <div className="h-3 w-px bg-slate-300" />
              <div>
                Activos: <strong className="text-emerald-700">{activeSellersCount}</strong>
              </div>
              <div className="h-3 w-px bg-slate-300" />
              <div>
                Leads: <strong className="text-slate-800">{totalLeadsSum.toLocaleString("es-PE")}</strong>
              </div>
              <div className="h-3 w-px bg-slate-300" />
              <div>
                Matriculados: <strong className="text-emerald-700">{totalMatriculatedSum.toLocaleString("es-PE")}</strong>
              </div>
              <div className="h-3 w-px bg-slate-300" />
              <div>
                Órdenes: <strong className="text-slate-800">{totalOrdersSum.toLocaleString("es-PE")}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Panel de asesores compacto con tabla, filtros y ordenamiento */}
        <SellerTeamPanel
          sellers={followUp.filteredAndSortedSellers}
          selectedSellerUserId={followUp.selectedSellerUserId}
          onSelectSeller={followUp.selectSeller}
          search={followUp.sellerSearch}
          onSearchChange={followUp.setSellerSearch}
          statusFilter={followUp.sellerStatusFilter}
          onStatusFilterChange={followUp.setSellerStatusFilter}
          sortBy={followUp.sellerSortBy}
          onSortByChange={followUp.setSellerSortBy}
          isLoading={followUp.isLoadingSellers}
          isError={followUp.isErrorSellers}
        />
      </section>

      {/* ===== BANNER CONTEXTUAL CUANDO HAY UN ASESOR SELECCIONADO ===== */}
      {followUp.selectedSeller && (
        <div className="flex flex-col gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-900 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Mostrando prospectos asignados a{" "}
              <strong className="font-bold text-slate-900">
                {followUp.selectedSeller.fullName}
              </strong>
              {followUp.selectedSeller.corporateEmail && (
                <span className="text-slate-500 ml-1">({followUp.selectedSeller.corporateEmail})</span>
              )}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={followUp.clearSellerSelection}
            className="h-7 border-sky-300 bg-white text-xs font-medium text-sky-800 hover:bg-sky-100 gap-1"
          >
            <X className="h-3.5 w-3.5" /> Quitar filtro
          </Button>
        </div>
      )}

      {/* ===== SECCIÓN INFERIOR: LEADS / CAMPAÑA ===== */}
      <Card className="overflow-hidden rounded-xl border-border/60 bg-white shadow-sm">
        <Tabs value={followUp.mode} onValueChange={handleModeChange}>
          <div className="flex flex-col gap-4 border-b bg-slate-50 p-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Control de asignación y seguimiento
              </span>
              <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-slate-200/60 p-1 sm:grid-cols-3 lg:w-auto">
                <TabsTrigger value="ALL" className="px-4 py-2 text-xs font-semibold uppercase">
                  Todos los leads
                </TabsTrigger>
                <TabsTrigger value="UNASSIGNED" className="px-4 py-2 text-xs font-semibold uppercase">
                  Sin asignar
                </TabsTrigger>
                <TabsTrigger value="CAMPAIGN" className="px-4 py-2 text-xs font-semibold uppercase">
                  Por campaña
                </TabsTrigger>
              </TabsList>
            </div>

            {isCampaignMode && (
              <div className="w-full space-y-1 lg:w-[320px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Seleccionar campaña
                </label>
                <Select
                  value={followUp.selectedCampaignId || undefined}
                  onValueChange={handleCampaignChange}
                  disabled={followUp.isLoadingCampaigns || followUp.isErrorCampaigns || followUp.campaigns.length === 0}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={followUp.isLoadingCampaigns ? "Cargando campañas…" : "Selecciona una campaña"} />
                  </SelectTrigger>
                  <SelectContent>
                    {followUp.campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>{campaign.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {followUp.isErrorCampaigns && (
                  <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={followUp.retryCampaigns}>
                    Reintentar carga de campañas
                  </Button>
                )}
                {!followUp.isLoadingCampaigns && !followUp.isErrorCampaigns && followUp.campaigns.length === 0 && (
                  <p className="text-xs text-muted-foreground">No hay campañas activas disponibles.</p>
                )}
              </div>
            )}
          </div>

          {isCampaignMode ? (
            <CampaignMembersPanel
              campaignId={followUp.selectedCampaignId}
              campaignName={followUp.selectedCampaign?.name}
              sellers={followUp.campaignAdvisors}
              variant="team-follow-up"
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {followUp.mode === "ALL" ? "Todos los leads" : "Leads sin asignar"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {`${followUp.leadTotal} prospectos encontrados.`}
                  </p>
                </div>
                {followUp.isFetchingLeads && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Actualizando" />}
              </div>

              <div className="grid grid-cols-1 gap-3 border-b bg-slate-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Buscar prospecto</label>
                  <Input
                    value={followUp.leadSearch}
                    onChange={(event) => followUp.setLeadSearch(event.target.value)}
                    placeholder="Nombre, correo, DNI o celular"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Estado del lead</label>
                  <Select
                    value={followUp.leadStatus}
                    onValueChange={(value) => {
                      if (value === "ALL" || isLeadStatus(value)) followUp.setLeadStatus(value);
                    }}
                  >
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos los estados</SelectItem>
                      {LEAD_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Asesor</label>
                  <Select
                    value={followUp.mode === "UNASSIGNED" ? "UNASSIGNED" : followUp.leadAdvisorUserId}
                    onValueChange={followUp.setLeadAdvisorUserId}
                    disabled={followUp.mode === "UNASSIGNED" || !followUp.canFilterByAdvisor}
                  >
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {followUp.mode === "UNASSIGNED" ? (
                        <SelectItem value="UNASSIGNED">Sin asignar</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="ALL">Todos los asesores</SelectItem>
                          {followUp.allAdvisors.map((advisor) => (
                            <SelectItem key={advisor.userId} value={advisor.userId}>{advisor.name}</SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {followUp.isLoadingLeads ? (
                <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" /> Cargando leads…
                </div>
              ) : followUp.isErrorLeads ? (
                <div className="space-y-3 px-4 py-16 text-center">
                  <p className="text-sm text-rose-700">No fue posible consultar los leads.</p>
                  <Button type="button" variant="outline" onClick={() => followUp.retryLeads()}>Reintentar</Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Registro</TableHead>
                          <TableHead>Prospecto</TableHead>
                          <TableHead>Correo</TableHead>
                          <TableHead>Celular</TableHead>
                          <TableHead>Estado general</TableHead>
                          <TableHead>Asesor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {followUp.leadRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                              No se encontraron leads.
                            </TableCell>
                          </TableRow>
                        ) : (
                          followUp.leadRows.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell>{formatDateTime(lead.createdAt)}</TableCell>
                              <TableCell className="font-medium">{lead.fullName || "No disponible"}</TableCell>
                              <TableCell>{lead.email || "No disponible"}</TableCell>
                              <TableCell>{lead.phone || "No disponible"}</TableCell>
                              <TableCell>{getLeadStatusLabel(lead.leadStatus)}</TableCell>
                              <TableCell>{lead.sellerName || "No disponible"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination
                    page={followUp.leadPage}
                    totalPages={followUp.leadTotalPages}
                    isFetching={followUp.isFetchingLeads}
                    onPageChange={followUp.setLeadPage}
                  />
                </>
              )}
            </>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default SupervisorFollowUpView;
