import { useNavigate } from "react-router-dom";
import { 
  SlidersHorizontal, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Pencil,
  Trash,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Skeleton } from "@/core/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { cn } from "@/core/lib/utils";
import { toast } from "sonner";

interface CampaignsTableProps {
  isLoading: boolean;
  isError: boolean;
  paginatedCampaigns: any[];
  totalCampaignsCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
  onDeleteClick: (campaign: { id: string; name: string }) => void;
  onEditClick?: (campaign: any) => void;
}

const platformColors: Record<string, string> = {
  FACEBOOK: "bg-blue-500 text-white hover:bg-blue-650 border-transparent",
  INSTAGRAM: "bg-pink-500 text-white hover:bg-pink-650 border-transparent",
  TIKTOK: "bg-foreground text-background hover:bg-foreground/90 border-transparent",
  WEBSITE: "bg-emerald-500 text-white hover:bg-emerald-650 border-transparent",
};

const formatCurrency = (value: number) => {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
};

const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const formatVigencia = (startDate: string, endDate: string | null | undefined) => {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "Sin fin";
  return `${start} - ${end}`;
};

export const CampaignsTable = ({
  isLoading,
  isError,
  paginatedCampaigns,
  totalCampaignsCount,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onDeleteClick,
  onEditClick,
}: CampaignsTableProps) => {
  const navigate = useNavigate();

  const renderSellers = (sellersList: any[]) => {
    if (!sellersList || sellersList.length === 0) {
      return <span className="text-muted-foreground/60 italic text-xs">Ninguno</span>;
    }

    const maxDisplayed = 3;
    const items = sellersList.slice(0, maxDisplayed);
    const extraCount = sellersList.length - maxDisplayed;

    return (
      <div className="flex items-center gap-1">
        {items.map((s, idx) => {
          const user = s.seller?.user || s.user;
          const firstName = user?.first_name || "";
          const lastName = user?.last_name || "";
          const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?";
          const fullName = `${firstName} ${lastName}`.trim() || `Asesor ${idx + 1}`;

          return (
            <div
              key={idx}
              title={fullName}
              className="h-6 w-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm"
            >
              {initials}
            </div>
          );
        })}
        {extraCount > 0 && (
          <div
            title={`${extraCount} asesores más`}
            className="h-6 w-6 rounded-full bg-muted text-muted-foreground border border-border flex items-center justify-center text-[10px] font-bold shrink-0"
          >
            +{extraCount}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <h2 className="font-bold text-foreground">Listado de Campañas</h2>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs px-3 py-2">
            <SlidersHorizontal size={14} /> Filtrar
          </button>
          <button className="btn-secondary text-xs px-3 py-2">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="text-center"><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-4 w-10 ml-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-destructive bg-card">
          <p className="font-bold">Error al conectar con el servidor.</p>
        </div>
      ) : paginatedCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card">
          <p>No hay campañas registradas aún.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                <TableHead className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider py-4 pl-6 w-[280px]">
                  Campaña
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider py-4">
                  Vigencia
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider py-4">
                  Presupuesto
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider py-4">
                  Gastado
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider py-4 text-center">
                  Leads
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider py-4">
                  Asesores
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider py-4 text-right">
                  Estado
                </TableHead>
                <TableHead className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider py-4 text-right pr-6 w-[80px]">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCampaigns.map((c: any) => {
                return (
                  <TableRow
                    key={c.id}
                    onClick={() => navigate(`/campanas/${c.id}`)}
                    className="cursor-pointer transition-colors border-b border-border hover:bg-muted/50"
                  >
                    {/* Columna CAMPAÑA agrupada - CORREGIDA de c.campaing_name a c.name */}
                    <TableCell className="font-medium py-4 pl-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm leading-none">
                            {c.name}
                          </span>
                          <Badge
                            className={cn(
                              "text-[9px] px-1.5 py-0 font-semibold uppercase tracking-wider rounded-md",
                              platformColors[c.platform] || "bg-gray-400 text-white"
                            )}
                          >
                            {c.platform || "N/E"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Curso: {c.relatedProduct?.name || "Sin asignar"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80">
                          Form: {c.meta_form_id || "N/E"} | ID: {c.id}
                        </p>
                      </div>
                    </TableCell>

                    {/* Columna VIGENCIA */}
                    <TableCell className="text-sm text-foreground">
                      {formatVigencia(c.start_date, c.end_date)}
                    </TableCell>

                    <TableCell className="text-foreground font-semibold">
                      {formatCurrency(Number(c.initial_budget) || 0)}
                    </TableCell>
                    <TableCell className="text-foreground font-semibold">
                      {formatCurrency(Number(c.total_spent) || 0)}
                    </TableCell>

                    {/* Columna LEADS - CORREGIDA de c._count?.members a c._count?.leadsOnCampaign */}
                    <TableCell className="text-center font-bold text-primary">
                      {c._count?.leadsOnCampaign || 0}
                    </TableCell>

                    <TableCell>
                      {renderSellers(c.sellers)}
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status === "ACTIVE" && (
                        <Badge
                          className="bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900 rounded-lg font-bold"
                          variant="outline"
                        >
                          ACTIVA
                    </Badge>
                      )}
                      {c.status === "PAUSED" && (
                        <Badge
                          className="bg-amber-50 text-amber-700 border-amber-250 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900 rounded-lg font-bold"
                          variant="outline"
                        >
                          PAUSADA
                    </Badge>
                      )}
                      {c.status === "INACTIVE" && (
                        <Badge
                          className="bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 rounded-lg font-bold"
                          variant="outline"
                        >
                          INACTIVA
                    </Badge>
                      )}
                      {!["ACTIVE", "PAUSED", "INACTIVE"].includes(c.status) && (
                        <Badge variant="outline" className="rounded-lg">
                          {c.status || "UNKNOWN"}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Columna ACCIONES */}
                    <TableCell
                      className="text-right pr-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuItem
                            onClick={() => navigate(`/campanas/${c.id}`)}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Eye size={14} className="text-muted-foreground" />
                            Ver detalles
                      </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditClick?.(c)}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Pencil size={14} className="text-muted-foreground" />
                            Editar configuración
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteClick({ id: c.id, name: c.name })}
                            className="flex items-center gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive animate-in fade-in"
                          >
                            <Trash size={14} className="text-destructive" />
                            Eliminar campaña
                      </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {paginatedCampaigns.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a{" "}
              {Math.min(currentPage * itemsPerPage, totalCampaignsCount)} de {totalCampaignsCount}{" "}
              campañas
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPageChange((prev) => Math.max(1, prev - 1));
                }}
                disabled={currentPage === 1}
                className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {currentPage}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPageChange((prev) => Math.min(totalPages, prev + 1));
                }}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
