import { useNavigate } from "react-router-dom";
import { useProductDetail } from "../hooks/useProductDetail";
import ProductStatusBadge from "@/features/orders/components/ProductStatusBadge";
import { 
  ArrowLeft, Edit, Loader2, Tag, BookOpen, DollarSign, 
  Calendar, Clock, User, Layers, Info, CheckCircle2,
  Gift, Award, Sparkles
} from "lucide-react";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";

const ProductDetailView = () => {
  const navigate = useNavigate();
  const { product, isLoading, isError, actions } = useProductDetail();
  const { formatCurrency, formatDate, formatAttendanceMode } = actions;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground w-full">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive w-full max-w-md mx-auto text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Info size={24} />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">Error al cargar la información</p>
          <p className="text-xs text-slate-500 mt-1">El producto comercial solicitado no pudo ser encontrado o el servidor no respondió correctamente.</p>
        </div>
        <Button variant="outline" className="rounded-xl mt-2" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  const edition = product.edition;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* HEADER SUPERIOR */}
      <div className="pt-2 mb-6 border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 shadow-sm"
            onClick={() => navigate("/productos")}
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {product.name}
              </h1>
              <ProductStatusBadge status={product.sales_status} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              ID Comercial: <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{product.id}</span> • Categoría: <span className="font-bold text-slate-700">{product.category?.name || "Sin Categoría"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
            onClick={() => navigate("/productos")}
          >
            Volver al catálogo
          </Button>
          <Button 
            className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20"
            onClick={() => navigate(`/productos/${product.id}/editar`)}
          >
            <Edit size={16} /> Editar Producto
          </Button>
        </div>
      </div>

      {/* DISEÑO EN 2 COLUMNAS (66% / 33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (66%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD 1: INFORMACIÓN COMERCIAL */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Tag size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Información Comercial</h3>
                  <p className="text-[11px] text-slate-500">Propuesta de marketing y descripción orientada al alumno.</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Resumen Comercial (Descripción Corta)</span>
                {product.short_description ? (
                  <p className="text-base text-slate-600 font-medium leading-relaxed italic border-l-3 border-primary/25 pl-4 py-0.5">
                    "{product.short_description}"
                  </p>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <Info size={14} className="shrink-0" />
                    <span className="text-xs">Resumen comercial no definido. Puedes agregarlo editando el producto.</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Detalle Completo</span>
                {product.description ? (
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/30 p-5 rounded-xl border border-slate-200/50">
                    {product.description}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <Info size={14} className="shrink-0" />
                    <span className="text-xs">Descripción detallada no disponible para este producto.</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* CARD 2: INFORMACIÓN ACADÉMICA */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                  <BookOpen size={16} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Vínculo Académico & Cohorte</h3>
                  <p className="text-[11px] text-slate-500">Configuración del programa, fechas límite y asignación de profesores.</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              {edition ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Código Cohorte</span>
                      <p className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-1 rounded inline-block">
                        {edition.edition_code || "Sin código"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profesor Principal</span>
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs pt-1">
                        <User size={14} className="text-slate-400" />
                        <span>{edition.teacher_fullname || "Por asignar"}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modalidad de Cohorte</span>
                      <p className="text-xs font-semibold text-slate-700 pt-1">
                        {formatAttendanceMode(edition.modality)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/40 p-4 rounded-xl border border-slate-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        <Calendar className="text-primary" size={15} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Inicio</span>
                        <span className="text-xs font-bold text-slate-700">{formatDate(edition.start_date, "PPP")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="text-slate-400" size={15} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Fin Estimada</span>
                        <span className="text-xs font-bold text-slate-700">{formatDate(edition.end_date, "PPP")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duración del Programa</span>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-800">
                          {edition.duration_value} {edition.duration_unit === "WEEKS" ? "Semanas" : "Meses"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Carga de Clases</span>
                      <span className="text-xs font-medium text-slate-700">
                        <span className="font-bold text-slate-900">{edition.classes_number || 0}</span> clases • <span className="font-bold text-slate-900">{edition.hours_amount || 0}</span> horas totales
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                  <BookOpen size={28} className="text-slate-350" />
                  <p className="text-xs text-slate-400 font-medium">Este producto no cuenta con un vínculo académico cohorte activo.</p>
                </div>
              )}
            </div>
          </Card>

          {/* CARD 3: BENEFICIOS Y CERTIFICACIONES */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Award size={16} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Beneficios & Certificaciones</h3>
                  <p className="text-[11px] text-slate-500">Regalos comerciales y diplomas certificados asociados al producto.</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Beneficios */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Gift size={13} className="text-primary" /> Beneficios Adicionales
                </h4>
                {product.relatedBenefits && product.relatedBenefits.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.relatedBenefits.map((rb: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/30">
                        <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          {rb.benefits?.description || "Beneficio Comercial"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex items-center gap-2 text-slate-400">
                    <Info size={14} className="shrink-0" />
                    <span className="text-xs">No hay beneficios asociados.</span>
                  </div>
                )}
              </div>

              {/* Certificaciones */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Award size={13} className="text-amber-600" /> Certificaciones Otorgadas
                </h4>
                {product.relatedCertifications && product.relatedCertifications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.relatedCertifications.map((rc: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/30">
                        <span className="text-xs font-bold text-slate-800 block">
                          {rc.certification?.title || "Certificación Oficial"}
                        </span>
                        {rc.certification?.description && (
                          <span className="text-[10px] text-slate-500 block mt-1 leading-normal">
                            {rc.certification.description}
                          </span>
                        )}
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {rc.certification?.has_digital && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold">Digital</span>
                          )}
                          {rc.certification?.has_physical && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[9px] font-bold">Físico</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex items-center gap-2 text-slate-400">
                    <Info size={14} className="shrink-0" />
                    <span className="text-xs">No hay certificaciones asociadas a este programa.</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

        </div>

        {/* COLUMNA DERECHA (33% - STICKY) */}
        <div className="space-y-6 lg:h-fit lg:sticky lg:top-4">
          
          {/* CARD 4: PORTADA COMERCIAL */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <div className="bg-slate-50/50 border-b border-slate-100 p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Portada Comercial</span>
            </div>
            <div className="p-4">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center group shadow-inner">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-50">
                    <BookOpen size={40} className="text-slate-300 mb-1.5" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sin portada configurada</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* CARD 5: CONFIGURACIÓN DE PRECIOS */}
          <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            <div className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Configuración Comercial</h3>
                  <p className="text-[10px] text-slate-500">Estructura de precios y financiamiento.</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-6">
              
              {/* Precios por modalidad */}
              <div className="space-y-4">
                {product.prices && product.prices.length > 0 ? (
                  product.prices.map((p: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-200/50 pb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Modalidad {formatAttendanceMode(p.attendance_mode)}
                        </span>
                      </div>
                      
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-semibold">Matrícula</span>
                          <span className="font-bold text-slate-800">{formatCurrency(p.enrollment_fee)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-semibold">Contado</span>
                          <span className="font-black text-emerald-600 text-sm">{formatCurrency(p.cash_price)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60 border-dashed">
                          <span className="text-slate-500 font-semibold">En Cuotas</span>
                          <span className="font-bold text-slate-800">{formatCurrency(p.installment_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400">
                    <Info size={14} className="shrink-0" />
                    <span className="text-xs">Sin precios configurados aún.</span>
                  </div>
                )}
              </div>

              {/* Ofertas Especiales / Preventas */}
              {(product.discount_price || product.presale_price) && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {product.discount_price && (
                    <div className="bg-emerald-50/50 p-4.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-emerald-700" />
                        <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">Precio Campaña</span>
                      </div>
                      <span className="font-black text-emerald-700 text-xs">{formatCurrency(product.discount_price)}</span>
                    </div>
                  )}

                  {product.presale_price && (
                    <div className="bg-amber-50/50 p-4.5 rounded-xl border border-amber-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-700" />
                        <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider">Precio Preventa</span>
                      </div>
                      <span className="font-black text-amber-700 text-xs">{formatCurrency(product.presale_price)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Rango de cuotas */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-slate-400 px-1">
                  <Layers size={13} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Financiamiento</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold">Cuotas Permitidas</span>
                  <span className="font-black text-slate-900 text-xs">{product.installments_min_number} - {product.installments_max_number} Meses</span>
                </div>
              </div>

            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default ProductDetailView;