import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { getProductById } from "../services/productService";
import { getBenefits } from "../services/benefitService";
import { useProductFormModal } from "../hooks/useProductFormModal";

import ProductPageHeader from "@/features/products/components/shared/ProductPageHeader";
import AcademicDetailsCard from "@/features/products/components/form/AcademicDetailsCard";
import CommercialConfigCard from "@/features/products/components/form/CommercialConfigCard";
import BenefitsCard from "@/features/products/components/form/BenefitsCard";
import CertificationCard from "@/features/products/components/form/CertificationCard";
import FAQsSectionCard from "@/features/products/components/form/FAQsSectionCard";
import CoverImageUploader from "@/features/products/components/form/CoverImageUploader";
import PricingCard from "@/features/products/components/form/PricingCard";
import { Button } from "@/core/components/ui/button";

const ProductFormView = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [activePriceTab, setActivePriceTab] = useState(0);

  // Obtener data inicial si estamos en modo edición
  const { data: productRes, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  const initialData = productRes?.success ? productRes.data : undefined;

  // Obtener beneficios dinámicos de la API
  const { data: benefitsRes, isLoading: isLoadingBenefits } = useQuery({
    queryKey: ["benefits"],
    queryFn: getBenefits,
  });

  const availableBenefits = benefitsRes?.data || [];

  const {
    form,
    errors,
    setFieldValue,
    setPriceValue,
    onSubmit,
    isLoadingEditions,
    editions,
    categories,
    isLoadingCategories,
    selectedEdition,
    isUploading,
    handleImageUpload,
    isPending,
    handleLoadDefaultFAQs
  } = useProductFormModal(true, () => navigate("/productos"), initialData);

  useEffect(() => {
    if (activePriceTab >= form.prices.length) {
      setActivePriceTab(0);
    }
  }, [form.prices.length, activePriceTab]);

  const handleToggleBenefit = (benefitId: string) => {
    const current = form.benefit_ids || [];
    if (current.includes(benefitId)) {
      setFieldValue("benefit_ids", current.filter(bId => bId !== benefitId));
    } else {
      setFieldValue("benefit_ids", [...current, benefitId]);
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando información del producto...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <ProductPageHeader
        title={isEdit ? "Editar Producto Comercial" : "Configurar Nuevo Producto"}
        subtitle={isEdit ? `Modificando detalles para: ${form.name}` : "Asigna cursos académicos, configura precios y añade beneficios comerciales."}
        onBack={() => navigate("/productos")}
        actions={
          <>
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={() => navigate("/productos")}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button 
              className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20"
              onClick={onSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save size={16} /> {isEdit ? "Actualizar Producto" : "Publicar Producto"}
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AcademicDetailsCard
            form={form}
            errors={errors}
            setFieldValue={setFieldValue}
            editions={editions}
            categories={categories}
            isLoadingEditions={isLoadingEditions}
            isLoadingCategories={isLoadingCategories}
            isEdit={isEdit}
            selectedEdition={selectedEdition}
          />

          <CommercialConfigCard
            form={form}
            errors={errors}
            setFieldValue={setFieldValue}
          />

          <BenefitsCard
            availableBenefits={availableBenefits}
            isLoadingBenefits={isLoadingBenefits}
            benefitIds={form.benefit_ids || []}
            errors={errors}
            onToggle={handleToggleBenefit}
            setFieldValue={setFieldValue}
          />

          <CertificationCard
            form={form}
            errors={errors}
            setFieldValue={setFieldValue}
          />

          <FAQsSectionCard
            form={form}
            setFieldValue={setFieldValue}
            handleLoadDefaultFAQs={handleLoadDefaultFAQs}
          />
        </div>

        <div className="space-y-6 lg:h-fit lg:sticky lg:self-end lg:bottom-4">
          <CoverImageUploader
            imageUrl={form.image_url}
            isUploading={isUploading}
            onUpload={handleImageUpload}
          />

          <PricingCard
            form={form}
            errors={errors}
            setFieldValue={setFieldValue}
            setPriceValue={setPriceValue}
            selectedEdition={selectedEdition}
            isEdit={isEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFormView;
