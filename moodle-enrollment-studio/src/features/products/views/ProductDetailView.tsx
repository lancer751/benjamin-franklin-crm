import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FileText, Info, LayoutDashboard, Pencil, ReceiptText, Sparkles } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import { useProductDetail } from "../hooks/useProductDetail";
import ProductStatusBadge from "../components/shared/ProductStatusBadge";
import ProductPageHeader from "../components/shared/ProductPageHeader";
import LinkEditionModal from "../components/detail/LinkEditionModal";
import ProductAcademicMetrics from "../components/detail/ProductAcademicMetrics";
import ProductAcademicSummary from "../components/detail/ProductAcademicSummary";
import ProductBenefitsList from "../components/detail/ProductBenefitsList";
import ProductCertificationList, {
  getProductCertificateResources,
  hasProductCertification,
} from "../components/detail/ProductCertificationList";
import ProductCoverCard from "../components/detail/ProductCoverCard";
import ProductDetailSkeleton from "../components/detail/ProductDetailSkeleton";
import ProductEssentialInfo from "../components/detail/ProductEssentialInfo";
import ProductFaqAccordion from "../components/detail/ProductFaqAccordion";
import ProductPricingGrid from "../components/detail/ProductPricingGrid";
import ProductPricingSummary from "../components/detail/ProductPricingSummary";
import ProductQuickActions from "../components/detail/ProductQuickActions";
import ProductTechnicalInfo from "../components/detail/ProductTechnicalInfo";
import { getModalityLabel } from "../utils/productDetailPresentation.utils";

type ProductDetailTab = "summary" | "academic" | "pricing" | "commercial";

const ProductDetailView = () => {
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.user?.role?.name || "");
  const [activeTab, setActiveTab] = useState<ProductDetailTab>("summary");
  const { product, isLoading, isError, actions } = useProductDetail();
  const { formatDate, modalMode, setModalMode, linkEdition, isLinking } = actions;

  if (isLoading) return <ProductDetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Info size={22} />
        </span>
        <div>
          <h1 className="text-base font-bold text-slate-900">No pudimos cargar el producto</h1>
          <p className="mt-1 text-sm text-slate-500">Intenta volver al catálogo y abrir el producto nuevamente.</p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => navigate("/productos")}>Volver al catálogo</Button>
      </div>
    );
  }

  const canEdit = userRole === "ADMIN" || userRole === "MARKETING";
  const hasCertification = hasProductCertification(product);
  const certificateResources = getProductCertificateResources(product);

  const subtitleItems = [
    product.category?.name,
    product.edition?.modality ? getModalityLabel(product.edition.modality) : null,
    product.edition?.start_date ? `Inicia el ${formatDate(product.edition.start_date, "PPP")}` : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <ProductPageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span>{product.name}</span>
            <ProductStatusBadge status={product.sales_status} />
          </span>
        }
        subtitle={<span>{subtitleItems.join(" · ") || "Producto comercial"}</span>}
        onBack={() => navigate("/productos")}
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => navigate("/productos")}>
              Volver al catálogo
            </Button>
            {canEdit && (
              <Button className="rounded-xl bg-blue-600 text-white hover:bg-blue-700" onClick={() => navigate(`/productos/${product.id}/editar`)}>
                <Pencil size={14} /> Editar producto
              </Button>
            )}
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProductDetailTab)} className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1.5 lg:grid-cols-4">
          <TabsTrigger value="summary" className="gap-2 rounded-xl py-2.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <LayoutDashboard size={14} /> Resumen
          </TabsTrigger>
          <TabsTrigger value="academic" className="gap-2 rounded-xl py-2.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookOpen size={14} /> Información académica
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2 rounded-xl py-2.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ReceiptText size={14} /> Precios y financiamiento
          </TabsTrigger>
          <TabsTrigger value="commercial" className="gap-2 rounded-xl py-2.5 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Sparkles size={14} /> Contenido comercial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6 outline-none">
          <ProductEssentialInfo product={product} formatDate={formatDate} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <ProductPricingSummary product={product} />
              <ProductAcademicMetrics product={product} formatDate={formatDate} />
            </div>
            <aside className="space-y-4">
              <ProductCoverCard imageUrl={product.image_url} productName={product.name} />
              <Card className="rounded-2xl border-slate-200 p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-900">Recursos del producto</h2>
                <ProductQuickActions
                  brochureUrl={product.brochure_url}
                  hasCertification={hasCertification}
                  certificateResources={certificateResources}
                  canEdit={false}
                  onEdit={() => undefined}
                />
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6 outline-none">
          <ProductAcademicSummary product={product} formatDate={formatDate} />
          {!product.edition && (
            <Card className="rounded-2xl border-dashed p-6 text-center">
              <p className="text-sm font-medium text-slate-600">Este producto todavía no tiene una edición académica vinculada.</p>
              {canEdit && (
                <Button variant="outline" className="mt-3 rounded-xl" onClick={() => setModalMode("LINK")}>Asignar edición</Button>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="outline-none">
          <ProductPricingGrid product={product} formatDate={formatDate} />
        </TabsContent>

        <TabsContent value="commercial" className="space-y-6 outline-none">
          <Card className="rounded-2xl border-slate-200 p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Contenido que se publicará en la web</h2>
            <div className="mt-5 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <ProductCoverCard imageUrl={product.image_url} productName={product.name} />
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Descripción corta</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{product.short_description || "No registrada"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Descripción detallada</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{product.description || "No registrada"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><FileText size={15} /> Brochure</p>
                  <ProductQuickActions
                    brochureUrl={product.brochure_url}
                    hasCertification={false}
                    certificateResources={[]}
                    canEdit={false}
                    onEdit={() => undefined}
                    showCertification={false}
                    showEdit={false}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-200 p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Beneficios incluidos</h2>
            <ProductBenefitsList benefits={product.benefits} />
          </Card>

          <Card id="product-certifications" className="scroll-mt-6 rounded-2xl border-slate-200 p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Certificaciones</h2>
            <ProductCertificationList product={product} />
          </Card>

          <Card className="rounded-2xl border-slate-200 p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-900">Preguntas frecuentes</h2>
            <ProductFaqAccordion product={product} />
          </Card>
        </TabsContent>
      </Tabs>

      <ProductTechnicalInfo product={product} formatDate={formatDate} />

      <LinkEditionModal
        isOpen={modalMode === "LINK"}
        onClose={() => setModalMode(null)}
        onLink={linkEdition}
        isPending={isLinking}
      />
    </div>
  );
};

export default ProductDetailView;
