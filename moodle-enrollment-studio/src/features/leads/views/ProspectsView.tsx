import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Edit3, Eye, Plus, Search, UserRound, Users } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Badge } from "@/core/components/ui/badge";
import { useProspects } from "../hooks/useProspects";

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo", INACTIVE: "Inactivo", NEW: "Nuevo", ATTEMPTED_CONTACT: "Intento de contacto",
  CONTACTED: "Contactado", QUALIFIED: "Calificado", UNQUALIFIED: "No calificado", FOLLOW_UP: "Seguimiento",
  ON_HOLD: "En espera", WON: "Ganado", LOST: "Perdido",
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(date);
};

const sellerName = (member: any) => {
  const user = member?.seller?.user;
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Sin asignar";
};

export const ProspectsView = () => {
  const navigate = useNavigate();
  const crm = useProspects();
  const statuses = useMemo(() => ["ACTIVE", "INACTIVE", "NEW", "ATTEMPTED_CONTACT", "CONTACTED", "QUALIFIED", "FOLLOW_UP", "WON", "LOST"], []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Prospectos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulta, filtra y da seguimiento a los prospectos registrados.</p>
        </div>
        <Button onClick={() => navigate("/prospectos/nuevo")} className="gap-2 self-start">
          <Plus className="h-4 w-4" /> Nuevo Prospecto
        </Button>
      </div>

      <Card className="p-4 shadow-sm">
        <div className={`grid gap-3 ${crm.canSeeAdvisors ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
          <label className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={crm.search} onChange={(event) => crm.setSearch(event.target.value)} placeholder="Buscar por nombre, correo, DNI o celular" className="pl-9" />
          </label>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={crm.campaignId} onChange={(event) => crm.setCampaignId(event.target.value)}>
            <option value="ALL">Todas las campañas</option>
            {crm.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={crm.status} onChange={(event) => crm.setStatus(event.target.value)}>
            <option value="ALL">Todas las etapas</option>
            {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
          {crm.canSeeAdvisors && (
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={crm.advisorId} onChange={(event) => crm.setAdvisorId(event.target.value)}>
              <option value="ALL">Todos los asesores</option>
              {crm.sellers.map((seller: any) => {
                const name = [seller.user?.first_name, seller.user?.last_name].filter(Boolean).join(" ") || `Asesor ${String(seller.id).slice(0, 6)}`;
                return <option key={seller.id} value={seller.id}>{name}</option>;
              })}
            </select>
          )}
          <label className="flex items-center gap-2 md:col-span-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Input type="date" value={crm.registeredOn} onChange={(event) => crm.setRegisteredOn(event.target.value)} aria-label="Fecha de registro" />
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-sm">
        {crm.isLoading ? (
          <div className="space-y-3 p-6">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
        ) : crm.isError ? (
          <div className="px-6 py-16 text-center"><p className="font-semibold text-destructive">No fue posible cargar los prospectos.</p><p className="mt-1 text-sm text-muted-foreground">Verifica tu acceso o vuelve a intentarlo.</p></div>
        ) : crm.leads.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center"><Users className="mb-3 h-10 w-10 text-muted-foreground/40" /><p className="font-semibold">No se encontraron prospectos</p><p className="text-sm text-muted-foreground">Ajusta los filtros para ampliar los resultados.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead className="border-b bg-muted/45 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="px-5 py-3">Registro</th><th className="px-5 py-3">Prospecto</th><th className="px-5 py-3">Campaña</th><th className="px-5 py-3">Contacto</th><th className="px-5 py-3">Celular</th><th className="px-5 py-3">Etapa</th><th className="px-5 py-3">Asesor</th><th className="px-5 py-3 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y">
                {crm.leads.map((lead) => {
                  const member = lead.campaignsEngaging[0];
                  return (
                    <tr key={lead.id} className="group hover:bg-muted/30">
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">{formatDate(lead.created_at)}</td>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{lead.first_name?.[0] || "P"}{lead.last_name?.[0] || ""}</span><div><p className="font-medium">{lead.fullName || "Prospecto sin nombre"}</p><p className="text-xs text-muted-foreground">{lead.dni || "Sin DNI"}</p></div></div></td>
                      <td className="max-w-[190px] px-5 py-4"><span className="block truncate" title={lead.courseName}>{lead.courseName || "Sin campaña"}</span>{lead.campaignsEngaging.length > 1 && <span className="text-xs text-primary">+{lead.campaignsEngaging.length - 1} más</span>}</td>
                      <td className="max-w-[210px] px-5 py-4"><span className="block truncate" title={lead.email}>{lead.email || "—"}</span></td>
                      <td className="whitespace-nowrap px-5 py-4 font-medium">{lead.phones[0]?.number || "—"}</td>
                      <td className="px-5 py-4"><Badge variant="secondary">{statusLabels[member?.status || lead.lead_status] || member?.status || lead.lead_status}</Badge></td>
                      <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-muted-foreground" />{sellerName(member)}</span></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(`/prospectos/${lead.id}`)}><Eye className="h-4 w-4" /> Ver</Button><Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(`/prospectos/${lead.id}/editar`)}><Edit3 className="h-4 w-4" /> Editar</Button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t px-5 py-3 text-sm text-muted-foreground">
          <span>Página {crm.page} de {crm.totalPages}</span>
          <div className="flex gap-2"><Button variant="outline" size="sm" disabled={crm.page <= 1} onClick={() => crm.setPage(crm.page - 1)}><ChevronLeft className="h-4 w-4" /> Anterior</Button><Button variant="outline" size="sm" disabled={crm.page >= crm.totalPages} onClick={() => crm.setPage(crm.page + 1)}>Siguiente <ChevronRight className="h-4 w-4" /></Button></div>
        </div>
      </Card>
    </div>
  );
};

export default ProspectsView;
