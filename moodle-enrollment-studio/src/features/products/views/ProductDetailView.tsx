import { useNavigate } from "react-router-dom";
import { useProductDetail } from "../hooks/useProductDetail";
import ProductStatusBadge from "@/features/products/components/shared/ProductStatusBadge";
import { 
  Edit, 
  Loader2, 
  Info, 
  HelpCircle, 
  GraduationCap, 
  Sparkles, 
  Award, 
  FileText,
  Download
} from "lucide-react";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/core/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/core/components/ui/accordion";
import { useAuthStore } from "@/store/useAuthStore";
import { PRODUCT_PERMISSIONS, RoleAccess } from "../utils/productPermissions";

import ProductPageHeader from "@/features/products/components/shared/ProductPageHeader";
import CommercialSection from "@/features/products/components/detail/CommercialSection";
import AcademicSection from "@/features/products/components/detail/AcademicSection";
import PricingCardList from "@/features/products/components/detail/PricingCardList";
import LinkEditionModal from "@/features/products/components/detail/LinkEditionModal";
import DetailSection from "@/features/products/components/shared/DetailSection";
import CertificationSection from "@/features/products/components/detail/CertificationSection";
import BenefitsSection from "@/features/products/components/detail/BenefitsSection";

const ProductDetailView = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentRole = user?.role?.name;
  const permissions = currentRole ? PRODUCT_PERMISSIONS[currentRole as RoleAccess] : undefined;

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

  // Preparación defensiva de las preguntas frecuentes (FAQs) ordenadas por faq.order
  const sortedFaqs = product.frequentQuestions && product.frequentQuestions.length > 0
    ? [...product.frequentQuestions].sort((a, b) => (a.faq?.order ?? 0) - (b.faq?.order ?? 0))
    : (product.faqs || []).map((f) => ({
        faq: {
          id: f.id,
          question: f.question,
          answer: f.answer,
          order: 0
        }
      }));


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
            {permissions?.canEditAll && (
              <Button 
                className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20"
                onClick={handleEditRedirect}
              >
                <Edit size={16} /> Editar Producto
              </Button>
            )}
          </>
        }
      />

      {/* ARQUITECTURA DE PESTAÑAS (TABS) */}
      <Tabs defaultValue="ficha-tecnica" className="w-full space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 max-w-xl border border-slate-200">
          <TabsTrigger 
            value="ficha-tecnica" 
            className="rounded-xl font-bold text-xs flex items-center justify-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-slate-600 data-[state=active]:text-slate-900"
          >
            <GraduationCap size={15} /> Ficha Técnica Académica y Precios
          </TabsTrigger>
          <TabsTrigger 
            value="marketing-cliente" 
            className="rounded-xl font-bold text-xs flex items-center justify-center gap-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all text-slate-600 data-[state=active]:text-slate-900"
          >
            <Sparkles size={15} /> Contenido Comercial y Marketing
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: FICHA TÉCNICA ACADÉMICA Y PRECIOS */}
        <TabsContent value="ficha-tecnica" className="outline-none focus:outline-none animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LADO IZQUIERDO (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <AcademicSection 
                edition={product.edition} 
                formatAttendanceMode={formatAttendanceMode} 
                formatDate={formatDate}
                onAssignClick={() => setModalMode('LINK')} 
                readonly={permissions?.readonly}
              />

              {/* SECCIÓN DE CERTIFICACIÓN */}
              <CertificationSection product={product} />
            </div>

            {/* LADO DERECHO (1/3) */}
            <div className="space-y-6">
              {/* PORTADA COMERCIAL */}
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

              {/* CARD DE PRECIOS */}
              <div className="lg:sticky lg:top-6 self-start space-y-4">
                <PricingCardList 
                  product={product} 
                  formatCurrency={formatCurrency} 
                  formatAttendanceMode={formatAttendanceMode}
                  formatDate={formatDate}
                />

                {/* BOTÓN DE ACCIÓN DIRECTA AL BROCHURE */}
                {product.brochure_url && (
                  <Button 
                    className="w-full rounded-2xl py-6 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 transition-all duration-200 flex items-center justify-center gap-2 font-bold text-xs"
                    onClick={() => window.open(product.brochure_url, "_blank")}
                  >
                    <Download size={15} /> Descargar Brochure Informativo
                  </Button>
                )}
              </div>
            </div>

          </div>
        </TabsContent>

        {/* TAB 2: CONTENIDO COMERCIAL Y MARKETING */}
        <TabsContent value="marketing-cliente" className="outline-none focus:outline-none space-y-6 animate-in fade-in duration-300">
          
          {/* INFORMACIÓN Y DESCRIPCIÓN COMERCIAL */}
          <CommercialSection product={product} />

          {/* SECCIÓN DE BENEFICIOS */}
          <BenefitsSection product={product} />

          {/* ACORDEÓN DE PREGUNTAS FRECUENTES (FAQs) */}
          <DetailSection 
            title="Preguntas Frecuentes" 
            description="Preguntas y respuestas comerciales para resolver dudas del alumno."
            icon={HelpCircle}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          >
            {sortedFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full space-y-3 border-none">
                {sortedFaqs.map((item, idx) => {
                  const faq = item.faq;
                  if (!faq) return null;
                  return (
                    <AccordionItem 
                      key={faq.id || idx} 
                      value={`faq-${faq.id || idx}`}
                      className="p-1 px-4 rounded-xl border border-slate-200/80 bg-slate-50/30 hover:border-slate-350 hover:bg-slate-50/50 transition-all duration-200 border-none"
                    >
                      <AccordionTrigger className="text-xs font-bold text-slate-800 leading-normal flex items-center justify-between hover:no-underline [&[data-state=open]]:text-primary transition-colors py-3">
                        <span className="flex items-center gap-2.5 text-left">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-[11px] text-slate-500 leading-relaxed pl-4 border-l border-slate-200 pb-3 pt-1">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <p className="text-xs font-medium text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No hay preguntas frecuentes registradas
              </p>
            )}
          </DetailSection>

        </TabsContent>
      </Tabs>

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