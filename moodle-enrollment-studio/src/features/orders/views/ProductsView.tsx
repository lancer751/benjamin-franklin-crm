import { 
  Plus, GraduationCap, MoreVertical, Loader2, User, Calendar, 
  AlertCircle, Clock 
} from "lucide-react";
import { useProductsView } from "../hooks/useProductsView";
import { Badge } from "@/core/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";
import ProductStatusBadge from "@/features/orders/components/ProductStatusBadge";

const ProductsView = () => {
  const { 
    products, 
    isLoading, 
    isError, 
    stats, 
    searchQuery, 
    actions, 
    modals 
  } = useProductsView();

  const getModalityBadge = (modality: string) => {
    const mod = (modality || "").toUpperCase();
    if (mod === "VIRTUAL") return <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none">VIRTUAL</Badge>;
    if (mod === "PRESENCIAL") return <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none">PRESENCIAL</Badge>;
    if (mod === "HIBRIDO") return <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-none">HÍBRIDO</Badge>;
    return <Badge variant="outline">{modality || "S/M"}</Badge>;
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    const num = Number(amount || 0);
    return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  const isUrgent = (date: string | null | undefined) => {
    if (!date) return false;
    const days = differenceInDays(new Date(date), new Date());
    return days >= 0 && days <= 7;
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona cursos, ediciones y precios del ecosistema académico.</p>
        </div>
        <button onClick={() => actions.navigate("/productos/nuevo")} className="btn-primary">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* --- STATS DINÁMICOS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Productos Activos</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {isLoading ? <Loader2 size={24} className="animate-spin text-muted-foreground" /> : stats.activeProductsCount}
          </p>
        </div>
        
        <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ediciones con Precio</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {isLoading ? <Loader2 size={24} className="animate-spin text-muted-foreground" /> : stats.uniqueEditionsCount}
          </p>
        </div>
        
        <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Inscritos</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {isLoading ? "-" : stats.totalInscritos}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Módulo de ventas</p>
        </div>
        
        <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Precio Promedio</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {isLoading ? "-" : `S/ ${stats.averagePrice.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Todos los Productos</h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Cargando catálogo...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive text-center p-4">
            <p className="font-bold">Error al conectar con el servidor.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mb-4 opacity-20" />
            <p>{searchQuery ? "No se encontraron productos coincidentes." : "No hay productos registrados."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Programa Académico</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Calendario e Inicio</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Modalidad</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Precios y Frescura</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => {
                  const basePrice = p.prices?.[0]?.cash_price || 0;
                  const startDate = p.edition?.start_date;
                  const urgent = isUrgent(startDate);

                  return (
                    <tr 
                      key={p.id} 
                      className="border-b border-border last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => actions.navigate(`/productos/${p.id}`)}
                    >
                    {/* 1. Programa Académico */}
                    <td className="px-6 py-4 min-w-[300px]">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <GraduationCap size={20} className="text-primary" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 leading-tight">
                            {p.name || "Sin nombre"}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User size={12} className="shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {p.edition?.teacher_fullname || "Profesor por asignar"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Calendario e Inicio */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={cn(
                        "flex flex-col gap-1",
                        urgent ? "text-orange-600" : "text-slate-700"
                      )}>
                        <div className="flex items-center gap-2 font-semibold">
                          <Calendar size={14} className={urgent ? "animate-pulse" : ""} />
                          {startDate ? format(new Date(startDate), "d 'de' MMMM, yyyy", { locale: es }) : "S/F"}
                          {urgent && <AlertCircle size={14} />}
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                          {urgent ? "Inscripciones Urgentes" : "Fecha de Lanzamiento"}
                        </p>
                      </div>
                    </td>

                    {/* 3. Modalidad */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getModalityBadge(p.edition?.modality)}
                      <div className="mt-1">
                        <ProductStatusBadge status={p.sales_status} />
                      </div>
                    </td>

                    {/* 4. Precios y Frescura */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-black text-slate-900">
                          S/ {Number(p.prices?.[0]?.cash_price || 0).toFixed(2)}
                        </span>
                        <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground font-medium">
                          <Clock size={10} />
                          {p.updated_at 
                            ? `Actualizado hace ${formatDistanceToNow(new Date(p.updated_at), { locale: es })}`
                            : "Sin registro de cambios"
                          }
                        </div>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="text-muted-foreground hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={18} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            actions.navigate(`/productos/${p.id}/editar`);
                          }} className="gap-2">
                            <Plus size={14} /> Editar Producto
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive focus:text-destructive-foreground gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              actions.handleDeleteRequest(p);
                            }}
                          >
                            <AlertCircle size={14} /> Eliminar Producto
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODALES --- */}

      <AlertDialog open={modals.showDeleteAlert} onOpenChange={modals.setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar el producto <b className="text-foreground">{modals.productToDelete?.name}</b>. 
              Esta acción no se puede deshacer y afectará la visibilidad en el catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={modals.isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={actions.confirmDelete}
              disabled={modals.isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {modals.isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar producto"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsView;