import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { ProspectsDateRangeFilter } from "../components/prospects/ProspectsDateRangeFilter";
import { ProspectsFilters } from "../components/prospects/ProspectsFilters";
import { ProspectsTable } from "../components/prospects/ProspectsTable";
import { useProspects } from "../hooks/useProspects";

export const ProspectsView = () => {
  const navigate = useNavigate();
  const prospects = useProspects();
  const totalLabel = prospects.total === 1
    ? "1 prospecto encontrado"
    : `${prospects.total} prospectos encontrados`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Prospectos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{prospects.description}</p>
          <p className="mt-2 text-xs font-medium text-muted-foreground" aria-live="polite">{totalLabel}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:self-start">
          <ProspectsDateRangeFilter
            value={prospects.dateRange}
            onApply={prospects.setDateRange}
            isApplyDisabled={prospects.isFetching}
          />
          <Button onClick={() => navigate("/prospectos/nuevo")} className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo Prospecto
          </Button>
        </div>
      </div>

      <ProspectsFilters controller={prospects} />

      <Card className="overflow-hidden shadow-sm">
        <ProspectsTable
          rows={prospects.rows}
          isLoading={prospects.isLoading}
          isFetching={prospects.isFetching}
          isError={prospects.isError}
          hasActiveFilters={prospects.hasActiveFilters}
          onView={(id) => navigate(`/prospectos/${id}`)}
          onEdit={(id) => navigate(`/prospectos/${id}/editar`)}
          onRetry={prospects.retryLeads}
          onClearFilters={prospects.clearFilters}
        />

        <div className="flex flex-col gap-3 border-t px-5 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Página {prospects.page} de {prospects.totalPages}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={prospects.page <= 1 || prospects.isLoading}
              onClick={() => prospects.setPage(prospects.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={prospects.page >= prospects.totalPages || prospects.isLoading}
              onClick={() => prospects.setPage(prospects.page + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProspectsView;
