import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, SlidersHorizontal, Download, ChevronLeft, ChevronRight, TrendingUp, CheckCircle2, XCircle, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import PaymentForm from "@/payments/components/PaymentForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPayments, deletePayment } from "@/payments/services/paymentService";
import { toast } from "sonner";
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
import { getOrders } from "@/orders/services/orderService";
import { getAllLeads } from "@/leads/services/leadService";

const PaymentsView = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Paso 1: Múltiple Fetching
  const { data: paymentsRes, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
  });

  const { data: ordersRes } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: leadsRes } = useQuery({
    queryKey: ["leads"],
    queryFn: getAllLeads,
  });

  // Mutación para Eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      toast.success("Pago eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setPaymentToDelete(null);
    },
    onError: () => {
      toast.error("No se pudo eliminar el pago. Asegúrate de que no esté CONFIRMADO.");
    }
  });

  const paymentsData = Array.isArray(paymentsRes) ? paymentsRes : (paymentsRes as any)?.data || [];
  const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes as any)?.data || [];
  const leads = Array.isArray(leadsRes) ? leadsRes : (leadsRes as any)?.data || [];

  // Paso 2: Matemáticas en Vivo (KPIs)
  const today = new Date().toISOString().split("T")[0];

  const { totalHoy, pendientesValidacion } = useMemo(() => {
    let sumHoy = 0;
    let countPendientes = 0;

    paymentsData.forEach((p: any) => {
      const dateStr = p.created_at || p.payment_date;
      const isToday = dateStr && dateStr.startsWith(today);
      if (isToday) {
        sumHoy += Number(p.amount) || 0;
      }

      if (p.payment_status !== "CONFIRMED") {
        countPendientes++;
      }
    });

    return { totalHoy: sumHoy, pendientesValidacion: countPendientes };
  }, [paymentsData, today]);

  // Paso 3: Paginación Client-Side
  const totalPages = Math.ceil(paymentsData.length / itemsPerPage);
  const paginatedPayments = paymentsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return first + last || "CL";
  };

  const getStatusLabel = (status: string) => {
    if (status === "CONFIRMED") return "Confirmado";
    if (status === "FAILED") return "Fallido";
    if (status === "REFUNDED") return "Reembolsado";
    return status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registro de Pagos</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra y valida los ingresos provenientes de las inscripciones activas y nuevas matrículas.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedPayment(null);
            setShowForm(true);
          }} 
          className="btn-primary"
        >
          <Plus size={18} /> Registrar Pago
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Hoy</p>
          <p className="text-2xl font-bold text-foreground mt-2">S/ {totalHoy.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p>
          <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-2"><TrendingUp size={12} /> +12% vs ayer</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pendientes Validación</p>
          <p className="text-2xl font-bold text-foreground mt-2">{pendientesValidacion.toString().padStart(2, '0')}</p>
          <p className="text-xs text-muted-foreground mt-2">Última actualización: hace un momento</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Meta Mensual</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-foreground">S/ 48,000</span>
            <span className="text-sm text-muted-foreground">/ S/ 60,000</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden mt-3">
            <div className="h-full rounded-full bg-primary" style={{ width: "80%" }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Pagos Recientes</h2>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"><SlidersHorizontal size={16} /></button>
            <button className="h-9 w-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"><Download size={16} /></button>
          </div>
        </div>
        {isLoadingPayments ? (
          <div className="py-10">
            <Loader2 className="animate-spin mx-auto mt-10 h-8 w-8 text-primary" />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Código Orden</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cliente</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Monto</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Método</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tipo</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p: any, i: number) => {
                  const order = orders.find((o: any) => o.id === p.order_id);
                  const lead = leads.find((l: any) => l.id === order?.lead_id);
                  const code = order?.order_code ? `#${order.order_code}` : "N/D";
                  const firstName = lead?.first_name || "Cliente";
                  const lastName = lead?.last_name || "Desconocido";
                  const initials = getInitials(firstName, lastName);
                  const email = lead?.email || "N/D";
                  const confirmed = p.payment_status === "CONFIRMED";
                  
                  return (
                    <tr key={p.id || i} onClick={() => navigate(`/pagos/${p.id}`)} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-primary font-semibold cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/pagos/${p.id}`); }}>{code}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{initials}</div>
                          <div>
                            <p className="font-medium text-foreground">{firstName} {lastName}</p>
                            <p className="text-xs text-muted-foreground">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">S/ {Number(p.amount).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{p.payment_method || "N/D"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${
                          p.type === "FULL" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>{p.type === "FULL" ? "PAGO ÚNICO" : "CUOTAS"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-sm font-medium ${confirmed ? "text-emerald-600" : "text-destructive"}`}>
                          {confirmed ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {getStatusLabel(p.payment_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedPayment({
                                ...p,
                                clienteOrden: p.order_id,
                                metodoPago: p.payment_method,
                                tipoPago: p.type,
                                monto: String(p.amount),
                                idTransaccion: p.transaccion_id,
                                payment_receipt: p.payment_receipt
                              });
                              setShowForm(true); 
                            }}
                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Editar Pago"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setPaymentToDelete(p);
                            }}
                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Eliminar Pago"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/pagos/${p.id}`); }}
                            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                            title="Ver Detalle"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No hay pagos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {paymentsData.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-3">
                <span className="text-sm text-muted-foreground">
                  Mostrando {paginatedPayments.length} de {paymentsData.length} registros
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                    className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-md flex items-center justify-center text-sm font-medium ${
                          currentPage === page 
                            ? "bg-primary text-primary-foreground" 
                            : "border border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                    className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <PaymentForm 
        open={showForm} 
        onClose={() => {
          setShowForm(false);
          setSelectedPayment(null);
        }} 
        initialData={selectedPayment}
      />

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro del pago de la base de datos.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(paymentToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar Pago"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentsView;
