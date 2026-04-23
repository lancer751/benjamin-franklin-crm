import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Ban, CreditCard, Plus, Pencil, User, CalendarDays, ShoppingCart, Loader2 } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import PaymentForm from "@/payments/components/PaymentForm";
import { useQuery } from "@tanstack/react-query";

import { getOrderById } from "@/orders/services/orderService";
import { getAllLeads } from "@/leads/services/leadService";
import { getProducts } from "@/orders/services/productService";
import { getCourseEditions } from "@/academic/services/courseService";

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  REFUNDED: "bg-blue-100 text-blue-700 border-blue-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
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

  // Paso 1: Múltiple Fetching de Datos Caché
  const { data: orderResponse, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  });

  const { data: leadsData } = useQuery({
    queryKey: ["leads"],
    queryFn: getAllLeads,
    enabled: !!id,
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: !!id,
  });

  const { data: editionsData } = useQuery({
    queryKey: ["editions"],
    queryFn: getCourseEditions,
    enabled: !!id,
  });

  if (isLoadingOrder) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Extrae la orden
  const order = orderResponse?.data || orderResponse; // Ajuste según tipado de SuccessResponse
  const leads = Array.isArray(leadsData) ? leadsData : (leadsData as any)?.data || [];
  const products = Array.isArray(productsData) ? productsData : (productsData as any)?.data || [];
  const editions = Array.isArray(editionsData) ? editionsData : (editionsData as any)?.data || [];

  if (!order) {
    return <div className="p-6">No se encontró la orden.</div>;
  }

  // Paso 2: Helpers de Cruce de Datos
  const lead = leads.find((l: any) => l.id === order.lead_id);

  const getProductDetails = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return { courseName: "Producto desconocido", editionName: "-" };

    const edition = editions.find((e: any) => e.id === product.edition_id);
    return {
      courseName: edition?.course?.name || "Curso no encontrado",
      editionName: product.category || edition?.name || "Edición no encontrada",
    };
  };

  // Paso 3: Mapeo del Header y Tarjetas
  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("es-PE")
    : "Fecha no disponible";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/ordenes")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Orden #{order.order_code}</h1>
            <Badge className={statusStyles[order.order_status] || "bg-gray-100 text-gray-700"}>
              {statusLabels[order.order_status] || order.order_status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Creada el {formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Edit size={16} className="mr-1" /> Editar Orden</Button>
          <Button variant="destructive" size="sm"><Ban size={16} className="mr-1" /> Anular Orden</Button>
          <Button size="sm" onClick={() => setShowPayment(true)}><CreditCard size={16} className="mr-1" /> Registrar Pago</Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prospecto</p>
            </div>
            {lead ? (
              <>
                <p className="font-semibold text-foreground">{lead.first_name} {lead.last_name}</p>
                <p className="text-sm text-muted-foreground mt-1">{lead.email}</p>
                <p className="text-sm text-muted-foreground">{lead.dni || lead.phone}</p>
              </>
            ) : (
              <p className="font-semibold text-foreground">Cliente no encontrado</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart size={16} className="text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vendedor</p>
            </div>
            <p className="font-semibold text-foreground">{order.generated_by ? order.generated_by : "Sistema / Venta Directa"}</p>
            <p className="text-sm text-muted-foreground mt-1">Ejecutivo de ventas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={16} className="text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fechas</p>
            </div>
            <p className="text-sm text-foreground"><span className="text-muted-foreground">Creación:</span> {formattedDate}</p>
            <p className="text-sm text-foreground mt-1"><span className="text-muted-foreground">Tipo:</span> Estándar</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Cursos de la Orden</CardTitle>
          <Button variant="outline" size="sm"><Plus size={14} className="mr-1" /> Agregar Curso a la Orden</Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Curso</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Edición</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Precio</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cupón</th>
                <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {order.orderDetails?.map((detail: any, i: number) => {
                const { courseName, editionName } = getProductDetails(detail.product_id);
                return (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{courseName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{editionName}</td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground">S/ {Number(detail.price).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">{detail.discount_code ? detail.discount_code : "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil size={14} /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="w-full md:w-[350px] ml-auto bg-muted/20 border border-border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-sm font-semibold text-foreground">S/ {Number(order.sub_total || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground">Descuento</span>
          <span className="text-sm font-semibold text-destructive">- S/ {Number(order.discount || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
        </div>
        <hr className="my-4 border-border" />
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-foreground uppercase tracking-wider">Total a Cobrar</span>
          <span className="text-2xl font-bold text-primary tracking-tight">S/ {Number(order.total_amount || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <PaymentForm open={showPayment} onClose={() => setShowPayment(false)} />
    </div>
  );
};

export default OrderDetailView;

