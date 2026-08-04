import { RefreshCw, Users } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/core/components/ui/tooltip";
import { cn } from "@/core/lib/utils";
import type { ProspectPresentationRow } from "../../adapters/leadAdapter";
import { formatProspectDate } from "../../utils/prospectDisplay";
import { ProspectRowActions } from "./ProspectRowActions";

interface ProspectsTableProps {
  rows: ProspectPresentationRow[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onRetry: () => void;
  onClearFilters: () => void;
}

const ACTIONS_ALIGNMENT_CLASS = "text-right";

const formatCampaignCount = (count: number): string => {
  if (count === 0) return "Sin campañas";
  if (count === 1) return "1 campaña";
  return `${count} campañas`;
};

function TableLoading() {
  return (
    <div className="space-y-3 p-6" aria-label="Cargando prospectos">
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((__, cellIndex) => <Skeleton key={cellIndex} className="h-10 w-full" />)}
        </div>
      ))}
    </div>
  );
}

export function ProspectsTable({ rows, isLoading, isFetching, isError, hasActiveFilters, onView, onEdit, onRetry, onClearFilters }: ProspectsTableProps) {
  if (isLoading) return <TableLoading />;

  if (isError) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <p className="font-semibold text-destructive">No fue posible cargar los prospectos.</p>
        <p className="mt-1 text-sm text-muted-foreground">Verifica tu conexión o vuelve a intentarlo.</p>
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}><RefreshCw className="h-4 w-4" aria-hidden="true" />Reintentar</Button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <Users className="mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="font-semibold">{hasActiveFilters ? "No se encontraron prospectos con los filtros seleccionados." : "No hay prospectos registrados."}</p>
        {hasActiveFilters && <Button type="button" variant="outline" className="mt-4" onClick={onClearFilters}>Limpiar filtros</Button>}
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      {isFetching && <div className="absolute right-4 top-3 z-20 rounded-full bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm" role="status">Actualizando…</div>}
      <Table className="min-w-[820px] table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-muted/95 text-xs uppercase tracking-wide backdrop-blur">
          <TableRow>
            <TableHead className="w-[12%]">Registro</TableHead>
            <TableHead className="w-[25%]">Prospecto</TableHead>
            <TableHead className="w-[22%]">Contacto</TableHead>
            <TableHead className="w-[12%]">Celular</TableHead>
            <TableHead className="w-[13%]">Campañas</TableHead>
            <TableHead className={cn("w-[16%]", ACTIONS_ALIGNMENT_CLASS)}>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">{formatProspectDate(row.createdAt)}</TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{row.initials}</span>
                  <div className="min-w-0">
                    <Tooltip><TooltipTrigger asChild><p className="line-clamp-2 font-medium" tabIndex={0}>{row.fullName}</p></TooltipTrigger><TooltipContent>{row.fullName}</TooltipContent></Tooltip>
                    <p className="mt-0.5 text-xs text-muted-foreground">{row.dni}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Tooltip><TooltipTrigger asChild><span className="block truncate" tabIndex={0}>{row.email}</span></TooltipTrigger><TooltipContent>{row.email}</TooltipContent></Tooltip>
              </TableCell>
              <TableCell className="whitespace-nowrap font-medium">{row.phone}</TableCell>
              <TableCell><Badge variant="secondary" className="whitespace-nowrap font-medium">{formatCampaignCount(row.campaignCount)}</Badge></TableCell>
              <TableCell className={ACTIONS_ALIGNMENT_CLASS}><ProspectRowActions prospectId={row.id} onView={onView} onEdit={onEdit} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
