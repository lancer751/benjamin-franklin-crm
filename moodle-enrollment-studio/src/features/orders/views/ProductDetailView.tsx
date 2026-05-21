import { useNavigate } from "react-router-dom";
import { useProductDetail } from "../hooks/useProductDetail";
import ProductStatusBadge from "@/features/orders/components/ProductStatusBadge";
import { 
  ArrowLeft, Edit, Loader2, Tag, BookOpen, DollarSign, 
  Calendar, Clock, User, Layers, Info, CheckCircle2 
} from "lucide-react";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";

const ProductDetailView = () => {
  const navigate = useNavigate();
  const { product, isLoading, isError, actions } = useProductDetail();
  const { modalMode, setModalMode, formatCurrency, formatDate, formatAttendanceMode } = actions;

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

  const edition = product.edition;

  return (
    <div className="flex flex-col gap-8 w-full fade-in pb-20">
      {/* 1. HERO SECTION & HEADER */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Banner/Imagen */}
        <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 relative group">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5">
                <BookOpen size={64} strokeWidth={1} className="text-primary/30 mb-4" />
                <span className="text-sm font-bold text-primary/60 uppercase tracking-widest">{product.name || "Curso"}</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <ProductStatusBadge status={product.sales_status} />
            </div>
          </div>
        </div>

        {/* Info Principal */}
        <div className="flex-1 space-y-4 pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            <ArrowLeft size={16} className="mr-2" /> Volver al catálogo
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
            {product.name}
          </h1>
          
          <div className="flex flex-wrap gap-3 items-center">
            <span className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-widest">
              {product.category?.name || "Sin Categoría"}
            </span>
            <span className="text-slate-400 font-mono text-xs">ID: {product.id}</span>
          </div>

          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Precio Contado desde</p>
                <p className="text-2xl font-black text-emerald-950">{formatCurrency(product.prices?.[0]?.cash_price)}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Layers className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest">Financiamiento</p>
                <p className="text-lg font-black text-indigo-950">
                  {product.installments_min_number} a {product.installments_max_number} Cuotas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA (CONTENIDO) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card: Información de Marketing */}
          <Card className="p-8 rounded-[2rem] border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <Button variant="outline" size="sm" onClick={() => setModalMode('MARKETING')} className="rounded-full">
                <Edit size={14} className="mr-2" /> Editar Contenido
              </Button>
            </div>
            
            <div className="flex items-center gap-3 text-slate-800 font-bold text-lg mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Tag size={20} className="text-primary" />
              </div>
              Descripción del Producto
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Resumen Comercial</p>
                <p className="text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
                  "{product.short_description || "Sin descripción corta disponible."}"
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Detalle Completo</p>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  {product.description || "No se ha proporcionado una descripción detallada para este producto."}
                </div>
              </div>
            </div>
          </Card>

          {/* Card: Detalles Académicos */}
          <Card className="p-8 rounded-[2rem] border-slate-200/60 shadow-xl shadow-slate-200/40 relative">
            <div className="absolute top-0 right-0 p-8">
              <Button variant="outline" size="sm" onClick={() => setModalMode('LINK')} className="rounded-full">
                <Edit size={14} className="mr-2" /> Cambiar Vínculo
              </Button>
            </div>

            <div className="flex items-center gap-3 text-slate-800 font-bold text-lg mb-8">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <BookOpen size={20} className="text-orange-600" />
              </div>
              Vínculo Académico: {edition?.edition_code}
            </div>

            {edition ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Profesor Principal</span>
                  </div>
                  <p className="font-bold text-slate-900">{edition.teacher_fullname || "Por asignar"}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Carga Académica</span>
                  </div>
                  <p className="font-bold text-slate-900">{edition.hours_amount || 0} Horas Totales</p>
                  <p className="text-xs text-slate-500">{edition.classes_number || 0} Clases programadas</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Duración</span>
                  </div>
                  <p className="font-bold text-slate-900">{edition.duration_value} {edition.duration_unit || "Sesiones"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 col-span-full grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-primary" size={18} />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Inicia</span>
                      <span className="font-bold text-slate-700">{formatDate(edition.start_date, "PPP")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-slate-400" size={18} />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Finaliza</span>
                      <span className="font-bold text-slate-700">{formatDate(edition.end_date, "PPP")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Este producto no tiene un vínculo académico activo.</p>
              </div>
            )}
          </Card>
        </div>

        {/* COLUMNA DERECHA (PRECIOS Y ESTRUCTURA) */}
        <div className="space-y-8">
          <Card className="p-8 rounded-[2rem] border-slate-200/60 shadow-xl shadow-slate-200/40 sticky top-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign size={20} className="text-emerald-600" />
                </div>
                Configuración de Precios
              </div>
              <Button variant="ghost" size="icon" onClick={() => setModalMode('PRICING')} className="rounded-full">
                <Edit size={16} />
              </Button>
            </div>

            <div className="space-y-6">
              {product.prices && product.prices.length > 0 ? (
                product.prices.map((p: any, i: number) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Modalidad {formatAttendanceMode(p.attendance_mode)}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Matrícula</span>
                        <span className="font-bold text-slate-900">{formatCurrency(p.enrollment_fee)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm font-medium">Contado</span>
                        <span className="text-xl font-black text-emerald-600">{formatCurrency(p.cash_price)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200/60 border-dashed">
                        <span className="text-slate-500 font-medium">Total en Cuotas</span>
                        <span className="font-bold text-slate-900">{formatCurrency(p.installment_price)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 italic text-sm">
                  No hay configuraciones de precio disponibles.
                </div>
              )}

              {product.discount_price && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Precio Oferta</span>
                  </div>
                  <span className="font-black text-emerald-700">{formatCurrency(product.discount_price)}</span>
                </div>
              )}

              {product.presale_price && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Precio Preventa</span>
                  </div>
                  <span className="font-black text-amber-700">{formatCurrency(product.presale_price)}</span>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-400 px-1">
                  <Layers size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Política de Cuotas</span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-sm text-slate-600">Rango permitido</span>
                  <span className="font-black text-slate-900">{product.installments_min_number} - {product.installments_max_number} Meses</span>
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