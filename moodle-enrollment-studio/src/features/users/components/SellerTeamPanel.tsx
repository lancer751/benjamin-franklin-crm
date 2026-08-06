import { ArrowUpRight, Check, ExternalLink, Search, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/core/components/ui/avatar";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Skeleton } from "@/core/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import type { SellerTeamCardModel } from "@/features/users/adapters/seller.adapter";
import type { SellerSortOption, SellerStatusFilter } from "@/features/leads/hooks/useSupervisorFollowUp";

interface SellerTeamPanelProps {
  sellers: SellerTeamCardModel[];
  selectedSellerUserId: string | null;
  onSelectSeller: (userId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: SellerStatusFilter;
  onStatusFilterChange: (value: SellerStatusFilter) => void;
  sortBy: SellerSortOption;
  onSortByChange: (value: SellerSortOption) => void;
  isLoading: boolean;
  isError: boolean;
}

export function SellerTeamPanel({
  sellers,
  selectedSellerUserId,
  onSelectSeller,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  isLoading,
  isError,
}: SellerTeamPanelProps) {
  const navigate = useNavigate();

  const handleNavigateToProfile = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (userId) {
      navigate(`/users/sellers/${userId}`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search and filter controls bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar asesor por nombre o correo…"
            className="pl-9 bg-white text-xs h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs/select */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onStatusFilterChange("ALL")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange("ACTIVE")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                statusFilter === "ACTIVE"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Activos
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange("INACTIVE")}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                statusFilter === "INACTIVE"
                  ? "bg-white text-slate-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Inactivos
            </button>
          </div>

          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={(val) => onSortByChange(val as SellerSortOption)}>
            <SelectTrigger className="h-9 w-[170px] bg-white text-xs">
              <SelectValue placeholder="Ordenar por…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Orden por defecto</SelectItem>
              <SelectItem value="leads">Más leads</SelectItem>
              <SelectItem value="matriculated">Más matriculados</SelectItem>
              <SelectItem value="orders">Más órdenes</SelectItem>
              <SelectItem value="name">Nombre (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-2 rounded-xl border bg-white p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b last:border-0">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-center text-xs text-rose-700">
          No se pudo cargar el equipo comercial.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && sellers.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500">
          No se encontraron asesores comerciales con los filtros aplicados.
        </div>
      )}

      {/* Table view (Desktop & Tablet) */}
      {!isLoading && !isError && sellers.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <Table>
              <TableHeader className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <TableRow>
                  <TableHead className="w-[280px]">Asesor</TableHead>
                  <TableHead className="w-[100px] text-center">Estado</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Matriculados</TableHead>
                  <TableHead className="text-right">Órdenes</TableHead>
                  <TableHead className="text-right">Campañas</TableHead>
                  <TableHead className="w-[120px] text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller) => {
                  const isSelected = selectedSellerUserId === seller.userId;
                  return (
                    <TableRow
                      key={seller.sellerProfileId || seller.userId}
                      role="button"
                      tabIndex={0}
                      aria-selected={isSelected}
                      onClick={() => onSelectSeller(seller.userId)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectSeller(seller.userId);
                        }
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-sky-50/80 font-medium text-slate-900 border-l-4 border-l-primary"
                          : seller.isActive
                          ? "hover:bg-slate-50/80"
                          : "bg-slate-50/40 opacity-70 hover:bg-slate-100/50"
                      }`}
                    >
                      {/* Asesor */}
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0 ring-1 ring-slate-200">
                            <AvatarFallback
                              className={`text-xs font-bold ${
                                seller.isActive
                                  ? "bg-primary/10 text-primary"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {seller.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="truncate text-xs font-semibold text-slate-900"
                                title={seller.fullName}
                              >
                                {seller.fullName}
                              </span>
                              {isSelected && (
                                <Badge
                                  variant="secondary"
                                  className="h-4 gap-1 px-1 text-[9px] font-bold bg-primary text-primary-foreground"
                                >
                                  <Check className="h-2.5 w-2.5" /> Seleccionado
                                </Badge>
                              )}
                            </div>
                            {seller.corporateEmail && (
                              <p
                                className="truncate text-[11px] text-slate-400"
                                title={seller.corporateEmail}
                              >
                                {seller.corporateEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="py-2.5 text-center">
                        {seller.isActive ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700"
                          >
                            Activo
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-100 text-[10px] font-semibold text-slate-500"
                          >
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>

                      {/* Leads */}
                      <TableCell className="py-2.5 text-right font-semibold text-slate-800">
                        {seller.totalLeads.toLocaleString("es-PE")}
                      </TableCell>

                      {/* Matriculados */}
                      <TableCell className="py-2.5 text-right font-semibold text-emerald-700">
                        {seller.totalMatriculated.toLocaleString("es-PE")}
                      </TableCell>

                      {/* Órdenes */}
                      <TableCell className="py-2.5 text-right font-semibold text-slate-800">
                        {seller.totalOrders.toLocaleString("es-PE")}
                      </TableCell>

                      {/* Campañas activas */}
                      <TableCell className="py-2.5 text-right text-xs text-slate-600">
                        {seller.activeCampaigns}
                      </TableCell>

                      {/* Acción "Ver perfil" */}
                      <TableCell className="py-2.5 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleNavigateToProfile(e, seller.userId)}
                          className="h-7 gap-1 text-[11px] font-medium text-primary hover:bg-primary/10 hover:text-primary"
                          title={`Ver perfil completo de ${seller.fullName}`}
                        >
                          Ver perfil <ArrowUpRight className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Layout (Compact Rows/Cards) */}
          <div className="space-y-2 md:hidden">
            {sellers.map((seller) => {
              const isSelected = selectedSellerUserId === seller.userId;
              return (
                <div
                  key={seller.sellerProfileId || seller.userId}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectSeller(seller.userId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectSeller(seller.userId);
                    }
                  }}
                  className={`flex flex-col gap-2 rounded-lg border p-3 text-xs transition-all ${
                    isSelected
                      ? "border-primary bg-sky-50/90 shadow-sm"
                      : seller.isActive
                      ? "border-slate-200 bg-white"
                      : "border-slate-200 bg-slate-50/50 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-7 w-7 shrink-0 ring-1 ring-slate-200">
                        <AvatarFallback
                          className={`text-[10px] font-bold ${
                            seller.isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {seller.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900" title={seller.fullName}>
                          {seller.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {seller.isActive ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-[9px] font-semibold text-emerald-700"
                        >
                          Activo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-100 text-[9px] font-semibold text-slate-500"
                        >
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-600">
                    <div>
                      Leads: <strong className="text-slate-800">{seller.totalLeads}</strong> ·
                      Matric.: <strong className="text-emerald-700">{seller.totalMatriculated}</strong> ·
                      Órdenes: <strong className="text-slate-800">{seller.totalOrders}</strong>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleNavigateToProfile(e, seller.userId)}
                      className="h-6 px-1.5 text-[10px] font-semibold text-primary"
                    >
                      Perfil <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
