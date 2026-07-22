import { CalendarDays, Search, X } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Skeleton } from "@/core/components/ui/skeleton";
import { cn } from "@/core/lib/utils";
import type { ProspectsController } from "../../hooks/useProspects";
import {
  LEAD_STATUS_OPTIONS,
  MEMBER_STATUS_OPTIONS,
  getMemberStatusLabel,
} from "../../utils/prospectDisplay";

const selectClassName = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border bg-muted/45 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Quitar filtro ${label}`}
    >
      {label}
      <X className="h-3 w-3" aria-hidden="true" />
    </button>
  );
}

interface ProspectsFiltersProps {
  controller: ProspectsController;
}

function getCampaignPlaceholder(controller: ProspectsController): string {
  if (controller.campaignsError) return "No fue posible cargar campañas";
  if (controller.isSalesRep && controller.campaigns.length === 0) {
    return "No tienes campañas asignadas";
  }
  return "Todas las campañas";
}

export function ProspectsFilters({ controller }: ProspectsFiltersProps) {
  const selectedCampaign = controller.campaigns.find((campaign) => campaign.id === controller.campaignId);
  const selectedSeller = controller.sellers.find((seller) => seller.id === controller.advisorId);
  const selectedLeadStatus = LEAD_STATUS_OPTIONS.find((status) => status.value === controller.leadStatus);
  const campaignPlaceholder = getCampaignPlaceholder(controller);

  return (
    <Card className="space-y-4 p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="prospect-search">Buscar prospectos</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="prospect-search"
              value={controller.search}
              onChange={(event) => controller.setSearch(event.target.value)}
              placeholder="Buscar por nombre, correo, DNI o celular"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prospect-campaign">Campaña</Label>
          {controller.areCampaignsLoading ? (
            <Skeleton className="h-10 w-full" aria-label="Cargando campañas" />
          ) : (
            <select
              id="prospect-campaign"
              className={selectClassName}
              value={controller.campaignId}
              onChange={(event) => controller.setCampaignId(event.target.value)}
            >
              <option value="ALL">{campaignPlaceholder}</option>
              {controller.campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prospect-stage">Etapa</Label>
          <select
            id="prospect-stage"
            className={selectClassName}
            value={controller.memberStatus}
            onChange={(event) => controller.setMemberStatus(event.target.value)}
          >
            <option value="ALL">Todas las etapas</option>
            {MEMBER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{getMemberStatusLabel(status)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={cn(
        "grid items-end gap-3 md:grid-cols-2",
        controller.canViewSeller ? "lg:grid-cols-[1fr_1fr_1fr_auto]" : "lg:grid-cols-[1fr_1fr_auto]",
      )}>
        <div className="space-y-1.5">
          <Label htmlFor="prospect-status">Estado del lead</Label>
          <select
            id="prospect-status"
            className={selectClassName}
            value={controller.leadStatus}
            onChange={(event) => controller.setLeadStatus(event.target.value)}
          >
            <option value="ALL">Todos los estados</option>
            {LEAD_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prospect-date">Fecha de registro</Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="prospect-date"
              type="date"
              value={controller.registeredOn}
              onChange={(event) => controller.setRegisteredOn(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {controller.canViewSeller && (
          <div className="space-y-1.5">
            <Label htmlFor="prospect-seller">Asesor</Label>
            <select
              id="prospect-seller"
              className={selectClassName}
              value={controller.advisorId}
              onChange={(event) => controller.setAdvisorId(event.target.value)}
            >
              <option value="ALL">Todos los asesores</option>
              {controller.sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>{seller.name}</option>
              ))}
            </select>
          </div>
        )}

        {controller.hasActiveFilters && (
          <Button type="button" variant="outline" onClick={controller.clearFilters} className="h-10">
            Limpiar filtros
          </Button>
        )}
      </div>

      {controller.hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t pt-3" aria-label="Filtros activos">
          <span className="text-xs font-medium text-muted-foreground">Filtros activos:</span>
          {controller.search.trim() && <FilterChip label={`Búsqueda: ${controller.search.trim()}`} onRemove={() => controller.setSearch("")} />}
          {selectedCampaign && <FilterChip label={`Campaña: ${selectedCampaign.name}`} onRemove={() => controller.setCampaignId("ALL")} />}
          {controller.memberStatus !== "ALL" && <FilterChip label={`Etapa: ${getMemberStatusLabel(controller.memberStatus)}`} onRemove={() => controller.setMemberStatus("ALL")} />}
          {selectedLeadStatus && <FilterChip label={`Estado: ${selectedLeadStatus.label}`} onRemove={() => controller.setLeadStatus("ALL")} />}
          {controller.registeredOn && <FilterChip label={`Fecha: ${controller.registeredOn}`} onRemove={() => controller.setRegisteredOn("")} />}
          {selectedSeller && <FilterChip label={`Asesor: ${selectedSeller.name}`} onRemove={() => controller.setAdvisorId("ALL")} />}
        </div>
      )}
    </Card>
  );
}
