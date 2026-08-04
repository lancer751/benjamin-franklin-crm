import { Search, X } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import type { ProspectsController } from "../../hooks/useProspects";
import { EMPTY_PROSPECT_DATE_RANGE } from "../../utils/prospectDateRange";
import { LEAD_STATUS_OPTIONS } from "../../utils/prospectDisplay";
import { ProspectsDateRangeFilter } from "./ProspectsDateRangeFilter";

const selectClassName = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const DATE_RANGE_CONTRACT_LIMITATION = "El filtro estará disponible cuando la API de prospectos admita fechas de inicio y fin.";

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

export function ProspectsFilters({ controller }: ProspectsFiltersProps) {
  const selectedSeller = controller.sellers.find((seller) => seller.userId === controller.advisorId);
  const selectedLeadStatus = LEAD_STATUS_OPTIONS.find((status) => status.value === controller.leadStatus);

  return (
    <Card className="space-y-4 p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
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

        <ProspectsDateRangeFilter
          value={EMPTY_PROSPECT_DATE_RANGE}
          applyDisabledReason={DATE_RANGE_CONTRACT_LIMITATION}
        />

        <div className="space-y-1.5">
          <Label htmlFor="prospect-status">Estado del lead</Label>
          <select
            id="prospect-status"
            className={selectClassName}
            value={controller.leadStatus}
            onChange={(event) => controller.setLeadStatus(event.target.value)}
          >
            <option value="ALL">Todos los estados</option>
            {LEAD_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
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
              {controller.sellers.map((seller) => <option key={seller.userId} value={seller.userId}>{seller.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {controller.hasActiveFilters && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={controller.clearFilters}>Limpiar filtros</Button>
        </div>
      )}

      {controller.hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t pt-3" aria-label="Filtros activos">
          <span className="text-xs font-medium text-muted-foreground">Filtros activos:</span>
          {controller.search.trim() && <FilterChip label={`Búsqueda: ${controller.search.trim()}`} onRemove={() => controller.setSearch("")} />}
          {selectedLeadStatus && <FilterChip label={`Estado: ${selectedLeadStatus.label}`} onRemove={() => controller.setLeadStatus("ALL")} />}
          {selectedSeller && <FilterChip label={`Asesor: ${selectedSeller.name}`} onRemove={() => controller.setAdvisorId("ALL")} />}
        </div>
      )}
    </Card>
  );
}
