import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Filter, Loader2, Receipt, Edit, Trash2 } from "lucide-react";
import OrderFormModal from "@/orders/components/OrderFormModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, deleteOrder } from "../services/orderService";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/core/components/ui/alert-dialog";

// Ajustamos los estilos para soportar los ENUMS exactos de Zod
const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
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

  // 2. Extraemos el array real
  const orders = Array.isArray(ordersRes) ? ordersRes : [];

  // 3. Lógica de filtrado (Segura contra nulls)
  const filtered = orders.filter((o: any) => {
    const searchTerm = search.toLowerCase();
    // Asumimos que Prisma puede devolver order_code o id
    const codeMatch = (o.order_code || o.id || "").toLowerCase().includes(searchTerm);
    return codeMatch;
  });

  // 4. Cálculo de KPIs dinámico
  const totalRevenue = orders
    .filter((o: any) => o.order_status === "COMPLETED")
    .reduce((s: number, o: any) => s + (Number(o.total_amount) || Number(o.total) || 0), 0);

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Órdenes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "-" : orders.length} órdenes registradas • Ingresos completados: S/ {totalRevenue.toLocaleString()}
          </p>
        </div>
        <button onClick={() => { setSelectedOrder(null); setShowNewOrder(true); }} className="btn-primary">
          <Plus size={18} /> Nueva Orden de Venta
        </button>
      </div>

      {/* --- KPIs DINÁMICOS --- */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Órdenes", value: isLoading ? "-" : orders.length, sub: "Este mes" },
          { label: "Completadas", value: isLoading ? "-" : orders.filter((o: any) => o.order_status === "COMPLETED").length, sub: "Pagadas" },
          { label: "Pendientes", value: isLoading ? "-" : orders.filter((o: any) => o.order_status === "PENDING").length, sub: "Por cobrar" },
          { label: "Ingresos", value: isLoading ? "-" : `S/ ${totalRevenue.toLocaleString()}`, sub: "Confirmados" },
        ].map((kpi, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* --- SEARCH & FILTER --- */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2.5 flex-1">
          <Search size={16} className="text-muted-foreground" />
          <input
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            placeholder="Buscar por ID de orden..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-secondary"><Filter size={16} /> Filtrar</button>
      </div>

      {/* --- TABLA Y ESTADOS --- */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Cargando órdenes desde la base de datos...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive">
            <p className="font-bold">Error al conectar con el servidor.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Receipt className="h-12 w-12 mb-4 opacity-20" />
            <p>No hay órdenes registradas. Haz clic en "Nueva Orden de Venta" para empezar.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-3">ID</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-3">Total</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-3">Estado</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-3">Fecha</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: any) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/ordenes/${order.id}`)}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-primary">
                    {order.order_code || order.id.split('-')[0]}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground">
                    S/ {Number(order.total_amount || order.total || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${statusStyles[order.order_status] || "bg-muted text-muted-foreground"}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Reciente'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/ordenes/${order.id}`); }}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        title="Ver Detalle"
                      >
                        <Eye size={14} /> Ver
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowNewOrder(true); }}
                        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        title="Editar Orden"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setOrderToDelete(order.id);
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
                        title="Eliminar Orden"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <OrderFormModal open={showNewOrder} onClose={() => setShowNewOrder(false)} initialData={selectedOrder} />

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => { if (!open) setOrderToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar orden de venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar permanentemente la orden. Esta acción no se puede deshacer y alterará los reportes financieros.
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