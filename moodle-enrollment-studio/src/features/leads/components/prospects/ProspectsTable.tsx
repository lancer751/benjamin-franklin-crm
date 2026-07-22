import { RefreshCw, UserRound, Users } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/core/components/ui/tooltip";
import { cn } from "@/core/lib/utils";
import type { ProspectPresentationRow } from "../../adapters/leadAdapter";
import {
  formatProspectDate,
  getMemberStatusLabel,
  getMemberStatusTone,
  getPlatformLabel,
} from "../../utils/prospectDisplay";
import { ProspectRowActions } from "./ProspectRowActions";

interface ProspectsTableProps {
  rows: ProspectPresentationRow[];
  showSeller: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onRetry: () => void;
  onClearFilters: () => void;
}

function TableLoading({ showSeller }: { showSeller: boolean }) {
  const columnCount = showSeller ? 8 : 7;
  return (
    <div className="space-y-3 p-6" aria-label="Cargando prospectos">
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div key={rowIndex} className={cn("grid gap-3", showSeller ? "grid-cols-8" : "grid-cols-7")}>
          {Array.from({ length: columnCount }).map((__, cellIndex) => (
            <Skeleton key={cellIndex} className="h-10 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ProspectsTable({
  rows,
  showSeller,
  isLoading,
  isFetching,
  isError,
  hasActiveFilters,
  onView,
  onEdit,
  onRetry,
  onClearFilters,
}: ProspectsTableProps) {
  if (isLoading) return <TableLoading showSeller={showSeller} />;

  if (isError) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <p className="font-semibold text-destructive">No fue posible cargar los prospectos.</p>
        <p className="mt-1 text-sm text-muted-foreground">Verifica tu conexión o vuelve a intentarlo.</p>
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <Users className="mb-3 h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
        <p className="font-semibold">
          {hasActiveFilters
            ? "No se encontraron prospectos con los filtros seleccionados."
            : "No hay prospectos registrados."}
        </p>
        {hasActiveFilters && (
          <Button type="button" variant="outline" className="mt-4" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {isFetching && (
        <div className="absolute right-4 top-3 z-20 rounded-full bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm" role="status">
          Actualizando…
        </div>
      )}
      <Table className={cn("table-fixed", showSeller ? "min-w-[1080px]" : "min-w-[920px]")}>
        <TableHeader className="sticky top-0 z-10 bg-muted/95 text-xs uppercase tracking-wide backdrop-blur">
          <TableRow>
            <TableHead className={showSeller ? "w-[9%]" : "w-[10%]"}>Registro</TableHead>
            <TableHead className={showSeller ? "w-[17%]" : "w-[21%]"}>Prospecto</TableHead>
            <TableHead className={showSeller ? "w-[15%]" : "w-[19%]"}>Campaña</TableHead>
            <TableHead className={showSeller ? "w-[14%]" : "w-[16%]"}>Contacto</TableHead>
            <TableHead className="w-[10%]">Celular</TableHead>
            <TableHead className="w-[10%]">Etapa</TableHead>
            {showSeller && <TableHead className="w-[11%]">Asesor</TableHead>}
            <TableHead className="w-[14%] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatProspectDate(row.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {row.initials}
                  </span>
                  <div className="min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="line-clamp-2 font-medium" tabIndex={0}>{row.fullName}</p>
                      </TooltipTrigger>
                      <TooltipContent>{row.fullName}</TooltipContent>
                    </Tooltip>
                    <p className="mt-0.5 text-xs text-muted-foreground">{row.dni}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-0 space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="truncate font-medium" tabIndex={0}>{row.campaignName}</p>
                    </TooltipTrigger>
                    <TooltipContent>{row.campaignName}</TooltipContent>
                  </Tooltip>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {row.campaignPlatform && (
                      <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium">
                        {getPlatformLabel(row.campaignPlatform)}
                      </Badge>
                    )}
                    {row.additionalCampaignCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-xs font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            +{row.additionalCampaignCount} más
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{row.additionalCampaignNames.join(", ")}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block truncate" tabIndex={0}>{row.email}</span>
                  </TooltipTrigger>
                  <TooltipContent>{row.email}</TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell className="whitespace-nowrap font-medium">{row.phone}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("whitespace-nowrap", getMemberStatusTone(row.memberStatus))}>
                  {getMemberStatusLabel(row.memberStatus)}
                </Badge>
              </TableCell>
              {showSeller && (
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="line-clamp-2">{row.sellerName}</span>
                  </span>
                </TableCell>
              )}
              <TableCell>
                <ProspectRowActions prospectId={row.id} onView={onView} onEdit={onEdit} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
