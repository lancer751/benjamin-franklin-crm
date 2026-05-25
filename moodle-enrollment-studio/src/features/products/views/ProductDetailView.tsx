import { useNavigate } from "react-router-dom";
import { useProductDetail } from "../hooks/useProductDetail";
import ProductStatusBadge from "@/features/products/components/shared/ProductStatusBadge";
import { Edit, Loader2, Info, HelpCircle } from "lucide-react";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";

import ProductPageHeader from "@/features/products/components/shared/ProductPageHeader";
import CommercialSection from "@/features/products/components/detail/CommercialSection";
import AcademicSection from "@/features/products/components/detail/AcademicSection";
import BenefitsAndCertificationsSection from "@/features/products/components/detail/BenefitsAndCertificationsSection";
import PricingCardList from "@/features/products/components/detail/PricingCardList";
import LinkEditionModal from "@/features/products/components/detail/LinkEditionModal";
import DetailSection from "@/features/products/components/shared/DetailSection";

const ProductDetailView = () => {
  const navigate = useNavigate();
  const { product, isLoading, isError, actions } = useProductDetail();
  const { 
    formatCurrency, 
    formatDate, 
    formatAttendanceMode, 
    modalMode, 
    setModalMode,
    linkEdition,
    isLinking
  } = actions;

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

  const handleEditRedirect = () => {
    navigate(`/productos/${product.id}/editar`);
  };

  const handleLinkEdition = (editionId: string) => {
    linkEdition(editionId);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* HEADER SUPERIOR */}
      <ProductPageHeader
        title={<>{product.name} <ProductStatusBadge status={product.sales_status} /></>}
        subtitle={
          <span>
            ID Comercial: <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{product.id}</span>
            {product.category?.name && (
              <> • Categoría: <span className="font-bold text-slate-700">{product.category.name}</span></>
            )}
          </span>
        }
        onBack={() => navigate("/productos")}
        actions={
          <>
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm"
              onClick={() => navigate("/productos")}
            >
              Volver al catálogo
            </Button>
            <Button 
              className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20"
              onClick={handleEditRedirect}
            >
              <Edit size={16} /> Editar Producto
            </Button>
          </>
        }
      />

      {/* DISEÑO EN 2 COLUMNAS (66% / 33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (66%) */}
        <div className="lg:col-span-2 space-y-6">
          <CommercialSection product={product} />
          
          <AcademicSection 
            edition={product.edition} 
            formatAttendanceMode={formatAttendanceMode} 
            formatDate={formatDate}
            onAssignClick={() => setModalMode('LINK')} 
          />
          
          <BenefitsAndCertificationsSection product={product} />

          {/* PREGUNTAS FRECUENTES (FAQs) */}
          <DetailSection 
            title="Preguntas Frecuentes" 
            description="Preguntas y respuestas comerciales para resolver dudas del alumno."
            icon={HelpCircle}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          >
            <div className="space-y-4">
              {product.faqs && product.faqs.length > 0 ? (
                product.faqs.map((faq) => (
                  <div key={faq.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50/50 transition-all duration-200 space-y-1.5">
                    <h5 className="text-xs font-bold text-slate-800 leading-normal flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      {faq.question}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed pl-3.5 border-l border-slate-200">
                      {faq.answer}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs font-medium text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  No hay preguntas frecuentes registradas
                </p>
              )}
            </div>
          </DetailSection>
        </div>

        {/* COLUMNA DERECHA (33% - Portada Natural & Precios Sticky) */}
        <div className="space-y-6">
          
          {/* PORTADA COMERCIAL (Condicional estricto) */}
          {product.image_url && (
            <Card className="shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-350 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white">
              <div className="bg-slate-50/50 border-b border-slate-100 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Portada Comercial</span>
              </div>
              <div className="p-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center group shadow-inner">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
              </div>
            </Card>
          )}

          {/* CONFIGURACIÓN DE PRECIOS STICKY */}
          <div className="lg:sticky lg:top-6 self-start">
            <PricingCardList 
              product={product} 
              formatCurrency={formatCurrency} 
              formatAttendanceMode={formatAttendanceMode}
              formatDate={formatDate}
            />
          </div>

        </div>

      </div>

      {/* MODAL DE VINCULACIÓN ACADÉMICA */}
      <LinkEditionModal 
        isOpen={modalMode === 'LINK'}
        onClose={() => setModalMode(null)}
        onLink={handleLinkEdition}
        isPending={isLinking}
      />
    </div>
  );
};

export default ProductDetailView;