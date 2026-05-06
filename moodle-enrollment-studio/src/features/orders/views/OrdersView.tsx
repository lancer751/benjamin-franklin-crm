import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Filter, Loader2, Receipt, Edit, Trash2, User, ShoppingBag, ShieldCheck } from "lucide-react";
import OrderFormModal from "@/features/orders/components/OrderFormModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, deleteOrder } from "../services/orderService";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/core/components/ui/alert-dialog";
import { cn } from "@/core/lib/utils";

// Estilos de estados
const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  REFUNDED: "bg-blue-100 text-blue-700 border-blue-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

// Traducciones de estados
const statusLabels: Record<string, string> = {
  COMPLETED: "Completada",
  PENDING: "Pendiente",
  REFUNDED: "Reembolsada",
  CANCELLED: "Cancelada",
};

const OrdersListView = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  // 1. Conexión con Hono RPC usando React Query
  const { data: ordersRes, isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      toast.success("Orden eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("Error al eliminar la orden");
    }
  });

  // 2. Extracción segura de datos
  const orders = ordersRes?.success ? ordersRes.data : [];

  // 3. Lógica de filtrado avanzada
  const filtered = orders.filter((o: any) => {
    const searchTerm = search.toLowerCase();
    const codeMatch = (o.order_code || "").toLowerCase().includes(searchTerm);
    const clientMatch = `${o.lead?.first_name || ""} ${o.lead?.last_name || ""}`.toLowerCase().includes(searchTerm);
    const dniMatch = (o.lead?.dni || "").toLowerCase().includes(searchTerm);
    // Búsqueda por Vendedor (Nuevo Objeto Anidado)
    const sellerMatch = `${o.seller?.user?.first_name || ""} ${o.seller?.user?.last_name || ""}`.toLowerCase().includes(searchTerm);
    
    return codeMatch || clientMatch || dniMatch || sellerMatch;
  });

  // 4. Cálculo de KPIs
  const totalRevenue = orders
    .filter((o: any) => o.order_status === "COMPLETED")
    .reduce((s: number, o: any) => s + (Number(o.total_amount) || 0), 0);

  const formatCurrency = (amount: number | string) => {
    return `S/ ${Number(amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Gestión de Ventas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Consultando base de datos..." : `${orders.length} órdenes registradas • Ingresos: ${formatCurrency(totalRevenue)}`}
          </p>
        </div>
        <button onClick={() => { setSelectedOrder(null); setShowNewOrder(true); }} className="btn-primary">
          <Plus size={18} /> Nueva Orden
        </button>
      </div>

      {/* --- KPIs DINÁMICOS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Órdenes", value: isLoading ? "-" : orders.length, sub: "Histórico" },
          { label: "Completadas", value: isLoading ? "-" : orders.filter((o: any) => o.order_status === "COMPLETED").length, sub: "Pagadas", color: "text-emerald-600" },
          { label: "Pendientes", value: isLoading ? "-" : orders.filter((o: any) => o.order_status === "PENDING").length, sub: "En seguimiento", color: "text-amber-600" },
          { label: "Caja (Ingresos)", value: isLoading ? "-" : formatCurrency(totalRevenue), sub: "Confirmado", color: "text-primary" },
        ].map((kpi, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className={cn("text-2xl font-bold mt-2", kpi.color || "text-foreground")}>{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* --- SEARCH --- */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 flex-1 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search size={16} className="text-muted-foreground" />
          <input
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            placeholder="Buscar por código, cliente, DNI o vendedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- TABLA --- */}
      <div className="rounded-xl bg-card border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p className="text-sm font-medium">Sincronizando con el servidor...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive text-center p-4">
            <p className="font-bold">Error de conexión.</p>
            <p className="text-xs mt-1">No se pudieron cargar las órdenes de venta.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Receipt className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-sm">No hay actividad comercial registrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-4">Código</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-4">Cliente</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-4">Asesor / Items</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-4">Estado</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-4">Total</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order: any) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/ordenes/${order.id}`)}
                    className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Código */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-primary text-xs tracking-tight">
                          {order.order_code || "#PENDIENTE"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Hoy'}
                        </span>
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-tight">
                          {order.lead?.first_name} {order.lead?.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <User size={10} />
                          {order.lead?.dni || "S/D"}
                        </span>
                      </div>
                    </td>

                    {/* Vendedor e Items */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold italic">
                          <ShieldCheck size={12} className={order.seller ? "text-primary" : "text-slate-400"} />
                          {order.seller?.user 
                            ? `${order.seller.user.first_name} ${order.seller.user.last_name}` 
                            : "Venta Directa"
                          }
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                          <ShoppingBag size={10} />
                          {order.orderDetails?.length || 0} ítems incluidos
                        </div>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-tight shadow-sm border",
                        statusStyles[order.order_status] || "bg-muted text-muted-foreground"
                      )}>
                        {statusLabels[order.order_status] || order.order_status}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="text-base font-black text-slate-900">
                        {formatCurrency(order.total_amount || 0)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/ordenes/${order.id}`); }}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Ver Detalle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowNewOrder(true); }}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-slate-200 rounded-lg transition-colors"
                          title="Editar Orden"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setOrderToDelete(order.id);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Eliminar Orden"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODALES --- */}
      <OrderFormModal open={showNewOrder} onClose={() => setShowNewOrder(false)} initialData={selectedOrder} />

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => { if (!open) setOrderToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta orden de venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la orden de forma permanente. Esta acción alterará los reportes de ventas y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (orderToDelete) deleteMutation.mutate(orderToDelete);
                setOrderToDelete(null);
              }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar orden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersListView;