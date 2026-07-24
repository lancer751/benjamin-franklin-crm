import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Edit, Ban, CreditCard, Plus, Pencil, User, 
  CalendarDays, ShoppingCart, Loader2, ShieldCheck, Mail, Fingerprint,
  Wallet, ListChecks, ArrowRight
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import PaymentForm from "@/features/payments/components/PaymentForm";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/features/orders/services/orderService";
import { cn } from "@/core/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  REFUNDED: "bg-blue-100 text-blue-700 border-blue-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusLabels: Record<string, string> = {
  COMPLETED: "Completada",
  PENDING: "Pendiente",
  REFUNDED: "Reembolsada",
  CANCELLED: "Cancelada",
};

const OrderDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const role = useAuthStore((state) => state.user?.role.name);
  const canEdit = ["ADMIN", "SALES_REP", "SALES_SUPERVISOR"].includes(role || "");

  // 1. Fetching Centralizado de la Orden (Trae todo anidado)
  const { data: orderResponse, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  });

  if (isLoadingOrder) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Cargando expediente financiero...</p>
      </div>
    );
  }

  const order = orderResponse?.data;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="p-4 bg-rose-50 rounded-full text-rose-500">
          <Ban size={40} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">Orden no encontrada</h2>
          <p className="text-muted-foreground">El identificador solicitado no existe o ha sido eliminado.</p>
        </div>
        <Button onClick={() => navigate("/ordenes")}>Volver al listado</Button>
      </div>
    );
  }

  const formatCurrency = (amount: number | string | undefined) => {
    return `S/ ${Number(amount || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "S/F";
    return new Date(date).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between bg-white p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ordenes")} className="hover:bg-slate-100">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Orden {order.order_code || `#${order.id.substring(0, 8)}`}</h1>
              <Badge className={cn("px-3 py-1 border shadow-none", statusStyles[order.order_status])}>
                {statusLabels[order.order_status] || order.order_status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <CalendarDays size={14} /> Registrada el {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {canEdit && (
            <Button
              variant="outline"
              className="flex-1 md:flex-none gap-2"
              onClick={() => navigate(`/ordenes/${order.id}/editar`)}
            >
              <Edit size={16} /> Editar
            </Button>
          )}
          <Button variant="destructive" className="flex-1 md:flex-none gap-2"><Ban size={16} /> Anular</Button>
          <Button onClick={() => setShowPayment(true)} className="flex-1 md:flex-none gap-2 shadow-lg shadow-primary/20">
            <CreditCard size={16} /> Registrar Pago
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- COLUMNA IZQUIERDA: DETALLES --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Información de Actores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alumno */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <div className="bg-primary/5 px-5 py-3 border-b border-primary/10 flex items-center gap-2">
                <User size={16} className="text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Información del Alumno</span>
              </div>
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg uppercase leading-tight">
                    {order.lead?.first_name} {order.lead?.last_name}
                  </h3>
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Fingerprint size={14} /> DNI: {order.lead?.dni || "S/D"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={14} /> {order.lead?.email || "Sin correo"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asesor */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-border flex items-center gap-2">
                <ShieldCheck size={16} className="text-slate-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Asesor Comercial</span>
              </div>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">
                  {order.seller?.user?.first_name?.[0]}{order.seller?.user?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-tight">
                    {order.seller?.user?.first_name} {order.seller?.user?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 italic">Venta Asistida</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. Productos / Items */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-border py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingCart size={18} className="text-primary" />
                Detalle Académico de la Orden
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50/30">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Programa / Edición</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Categoría</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Precio Pactado</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderDetails?.map((item, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 leading-tight">
                            {item.product?.edition?.course?.name || item.product?.name}
                          </span>
                          <span className="text-xs text-primary font-mono mt-0.5">
                            Cod: {item.product?.edition?.edition_code || "S/C"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-white">
                          {item.product?.category?.name || "General"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">
                        {formatCurrency(item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* 3. Cronograma de Pagos */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-border py-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ListChecks size={18} className="text-primary" />
                Cronograma de Pagos (Plan)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50/30">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cuota</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Vencimiento</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Monto</th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {order.paymentPlans?.[0]?.installments?.length > 0 ? (
                    order.paymentPlans[0].installments.map((cuota, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">Cuota #{cuota.installment_number}</td>
                        <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                          <CalendarDays size={14} />
                          {formatDate(cuota.due_date)}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{formatCurrency(cuota.amount)}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={cn(
                            "text-[10px] uppercase font-bold",
                            cuota.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                          )}>
                            {cuota.status === "PAID" ? "Pagado" : "Pendiente"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                        No hay cuotas programadas para esta orden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* --- COLUMNA DERECHA: RESUMEN FINANCIERO --- */}
        <div className="space-y-8">
          
          {/* Card de Resumen */}
          <Card className="border-none bg-slate-900 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet size={80} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Subtotal Bruto</span>
                  <span className="font-bold">{formatCurrency(order.sub_total)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-emerald-400">
                  <span className="opacity-80">Descuento Global</span>
                  <span className="font-bold">- {formatCurrency(order.discount)}</span>
                </div>
              </div>
              
              <hr className="border-slate-800" />
              
              <div className="pt-2">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Total Final a Cobrar</p>
                <h4 className="text-4xl font-black tracking-tighter text-white">
                  {formatCurrency(order.total_amount)}
                </h4>
              </div>
            </CardContent>
          </Card>

          {/* Registro de Pagos Realizados */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 flex-row items-center justify-between border-b border-border bg-slate-50/50 rounded-t-xl">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Historial de Pagos</CardTitle>
              <Badge variant="outline" className="bg-white">{order.payments?.length || 0} Abonos</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto">
                {order.payments?.length > 0 ? (
                  order.payments.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <ArrowRight size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-medium">{p.payment_method} • {formatDate(p.payment_date)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-emerald-200 text-emerald-600 bg-emerald-50">ÉXITO</Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <div className="flex justify-center">
                      <ShoppingCart size={32} className="text-slate-200" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium italic">Aún no se han registrado abonos para esta orden.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Modal de Pago */}
      <PaymentForm open={showPayment} onClose={() => setShowPayment(false)} />
    </div>
  );
};

export default OrderDetailView;
