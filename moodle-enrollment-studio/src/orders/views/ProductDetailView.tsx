import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "../services/productService";
import { getCourseEditions, getModalities } from "@/academic/services/courseService";
// 🧠 Importaremos el nuevo modal dinámico que creará Antigravity
import DynamicProductModal from "@/orders/components/DynamicProductModal"; 
import { ArrowLeft, Edit, Loader2, Tag, BookOpen, DollarSign, Calendar } from "lucide-react";
import { Card } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ProductDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 🧠 NUEVO ESTADO: Maneja qué parte del modal queremos abrir
  const [modalMode, setModalMode] = useState<'MARKETING' | 'PRICING' | 'LINK' | null>(null);

  const { data: productRes, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  const { data: editionsRes } = useQuery({
    queryKey: ["editions"],
    queryFn: getCourseEditions,
  });

  const { data: modalitiesRes } = useQuery({
    queryKey: ["modalities"],
    queryFn: getModalities,
  });

  const product = productRes?.data || productRes;
  const editions = Array.isArray(editionsRes) ? editionsRes : (editionsRes?.data || []);
  const modalities = Array.isArray(modalitiesRes) ? modalitiesRes : (modalitiesRes?.data || []);
  
  const selectedEdition = editions.find((e: any) => e.id === product?.edition_id);
  const selectedModality = modalities.find((m: any) => m.id === selectedEdition?.modality_id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ON_SALE": return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">ON_SALE</Badge>;
      case "DRAFT": return <Badge variant="secondary">DRAFT</Badge>;
      case "PUBLISHED": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">PUBLISHED</Badge>;
      case "COMPLETED": return <Badge className="bg-purple-100 text-purple-800 border-purple-200">COMPLETED</Badge>;
      case "CANCELLED": return <Badge variant="destructive">CANCELLED</Badge>;
      default: return <Badge variant="outline">{status || "UNKNOWN"}</Badge>;
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "N/A";
    return `S/ ${Number(amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground w-full">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-lg">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-destructive w-full">
        <p className="text-lg font-bold">Error al cargar el producto o no encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full fade-in pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Detalle del Producto</h1>
              {getStatusBadge(product.sales_status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              ID: {product.id}
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna Principal - span 2 */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Card: Contenido de Marketing */}
          <Card className="p-6 border-border/60 shadow-sm relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Tag size={18} className="text-primary" />
                <h3>Contenido de Marketing</h3>
              </div>
              {/* 🧠 ABRE EL MODAL EN MODO MARKETING */}
              <Button variant="ghost" size="sm" onClick={() => setModalMode('MARKETING')} className="text-muted-foreground hover:text-primary">
                <Edit size={16} className="mr-1.5" /> Editar
              </Button>
            </div>
            
            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Categoría</label>
                  <p className="text-foreground font-medium uppercase">{product.category || "Sin Categoría"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Slug (URL amigable)</label>
                  <p className="text-foreground font-medium">{product.slug || "No configurado"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Descripción Corta</label>
                <p className="text-foreground font-medium bg-muted/30 p-3 rounded-lg border border-border/50 text-sm">
                  {product.short_description || "Sin descripción corta"}
                </p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Descripción Detallada</label>
                <div className="text-foreground font-medium bg-muted/30 p-3 rounded-lg border border-border/50 text-sm whitespace-pre-wrap min-h-[100px]">
                  {product.description || "Sin descripción detallada"}
                </div>
              </div>
            </div>
          </Card>

          {/* Card: Vínculo Académico */}
          <Card className="p-6 border-border/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <BookOpen size={18} className="text-primary" />
                <h3>Vínculo Académico</h3>
              </div>
              {/* 🧠 ABRE EL MODAL EN MODO VÍNCULO */}
              <Button variant="ghost" size="sm" onClick={() => setModalMode('LINK')} className="text-muted-foreground hover:text-primary">
                <Edit size={16} className="mr-1.5" /> Cambiar Vínculo
              </Button>
            </div>
            
            {selectedEdition ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground block mb-1">Programa Académico</label>
                  <p className="text-foreground font-medium">{selectedEdition.course?.name || "Sin Nombre"}</p>
                  <p className="text-sm text-muted-foreground font-mono mt-0.5">{selectedEdition.edition_code}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Fecha de Inicio</label>
                  <p className="text-foreground font-medium">
                    {selectedEdition.start_date ? format(new Date(selectedEdition.start_date), "dd/MM/yyyy") : "No definida"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Fecha de Fin</label>
                  <p className="text-foreground font-medium">
                    {selectedEdition.end_date ? format(new Date(selectedEdition.end_date), "dd/MM/yyyy") : "No definida"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground block mb-1">Modalidad</label>
                  <p className="text-foreground font-medium uppercase">{selectedModality?.name || selectedEdition.modality || "No definida"}</p>
                </div>
              </div>
            ) : (
              <div className="bg-muted/50 p-6 rounded-lg text-center border border-dashed border-border/60">
                <p className="text-muted-foreground mb-2">Edición no encontrada o eliminada</p>
                <div className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground bg-background px-3 py-1.5 rounded border border-border/50">
                  <BookOpen size={14} />
                  {product?.edition_id || "No vinculado"}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Columna Lateral - span 1 */}
        <div className="md:col-span-1 flex flex-col gap-6">
          
          {/* Card: Precios y Ofertas */}
          <Card className="p-6 border-border/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <DollarSign size={18} className="text-emerald-500" />
                <h3>Precios y Ofertas</h3>
              </div>
              {/* 🧠 ABRE EL MODAL EN MODO PRECIOS */}
              <Button variant="ghost" size="sm" onClick={() => setModalMode('PRICING')} className="text-muted-foreground hover:text-primary">
                <Edit size={16} />
              </Button>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center py-2 border-b border-border/50 border-dashed">
                <span className="text-sm text-muted-foreground">Precio Base (Efectivo)</span>
                <span className="text-foreground font-bold">{formatCurrency(product.cash_price)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-border/50 border-dashed">
                <span className="text-sm text-muted-foreground">Precio en Cuotas</span>
                <span className="text-foreground font-medium">{formatCurrency(product.installment_price)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border/50 border-dashed">
                <span className="text-sm text-muted-foreground">Precio con Descuento</span>
                <span className="text-foreground font-medium text-emerald-600">
                  {product.discount_price ? formatCurrency(product.discount_price) : "Sin descuento"}
                </span>
              </div>

              {product.discount_expires_at && (
                <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-lg flex items-start gap-2 mt-2">
                  <Calendar size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Expiración del Descuento</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      {format(new Date(product.discount_expires_at), "dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 🧠 EL MODAL DINÁMICO RECIBE LOS DATOS */}
      <DynamicProductModal 
        open={!!modalMode} 
        mode={modalMode} 
        onClose={() => setModalMode(null)} 
        product={product} 
      />
    </div>
  );
};

export default ProductDetailView;