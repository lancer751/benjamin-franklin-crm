import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getProductById } from "../services/productService";
import { useProductFormModal } from "../hooks/useProductFormModal";
import { useProductContentActions } from "../hooks/useProductContentActions";
import { useAuthStore } from "@/store/useAuthStore";
import { PRODUCT_PERMISSIONS, RoleAccess } from "../utils/productPermissions";
import { getProductRequirements, getStepState, ProductFormStepId } from "../utils/productFormRequirements";
import ProductFormStepper, { ProductFormStep } from "../components/form/ProductFormStepper";
import ProductFormHeader from "../components/form/ProductFormHeader";
import ProductFormActions from "../components/form/ProductFormActions";
import ProductReviewSummary from "../components/form/ProductReviewSummary";
import ProductCommercialSection from "../components/commercial/ProductCommercialSection";
import ProductMarketingSection from "../components/marketing/ProductMarketingSection";
import ProductWebContentSection from "../components/web-content/ProductWebContentSection";

const ALL_STEPS: ProductFormStep[] = [
  { id: "commercial", label: "Información comercial", description: "Cohorte, categoría y precios" },
  { id: "marketing", label: "Material comercial", description: "Activos y argumentos" },
  { id: "web", label: "Publicación web", description: "Contenido y estado" },
  { id: "review", label: "Revisión", description: "Checklist final" },
];

const ProductFormView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const authUser = useAuthStore((state) => state.user);
  const role = (authUser?.role?.name || "ADMIN") as RoleAccess;
  const permissions = PRODUCT_PERMISSIONS[role] || PRODUCT_PERMISSIONS.ADMIN;
  const [activeStep, setActiveStep] = useState<ProductFormStepId>(role === "MARKETING" ? "marketing" : "commercial");

  const { data: productResponse, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: Boolean(id),
  });
  const initialData = (productResponse as any)?.success ? (productResponse as any).data : undefined;

  const {
    form,
    errors,
    setFieldValue,
    setPriceValue,
    onSubmit,
    validateForm,
    isLoadingEditions,
    isEditionsError,
    editions,
    categories,
    isLoadingCategories,
    isCategoriesError,
    selectedEdition,
    isUploading,
    handleImageUpload,
    isPending,
    handleLoadDefaultFAQs,
    availableBenefits,
    isLoadingBenefits,
    isBenefitsError,
  } = useProductFormModal(
    true,
    (data: any) => {
      if (!id && data?.success && data?.data?.id) {
        toast.success("Producto base creado. Continúa con el material comercial.");
        navigate(`/productos/${data.data.id}/editar`, { replace: true });
        setActiveStep("marketing");
      }
    },
    initialData,
  );

  const {
    saveMarketing,
    saveWebContent,
    saveDraftContent,
    handleBrochureFileChange,
    isSavingMarketing,
    isSavingWeb,
    isUploadingBrochure,
  } = useProductContentActions({ productId: id, form, setFieldValue });

  const requirements = useMemo(() => getProductRequirements(form), [form]);
  const visibleSteps = useMemo(() => {
    const allowed = new Set<ProductFormStepId>();
    if (permissions.allowedTabs.includes("general")) allowed.add("commercial");
    if (permissions.allowedTabs.includes("marketing")) allowed.add("marketing");
    if (permissions.allowedTabs.includes("commercial")) allowed.add("web");
    allowed.add("review");
    return ALL_STEPS.filter((step) => allowed.has(step.id));
  }, [permissions.allowedTabs]);

  const stepStates = useMemo(() => ({
    commercial: getStepState(requirements, "commercial"),
    marketing: getStepState(requirements, "marketing"),
    web: getStepState(requirements, "web"),
    review: getStepState(requirements, "review"),
  }), [requirements]);

  useEffect(() => {
    if (!visibleSteps.some((step) => step.id === activeStep)) setActiveStep(visibleSteps[0]?.id || "review");
  }, [activeStep, visibleSteps]);

  const nextStep = () => {
    const index = visibleSteps.findIndex((step) => step.id === activeStep);
    return visibleSteps[index + 1]?.id;
  };

  const handleStepChange = (step: ProductFormStepId) => {
    if (!id && step !== "commercial") {
      toast.info("Guarda primero la información comercial para crear el producto base");
      return;
    }
    setActiveStep(step);
  };

  const handleToggleBenefit = (benefitId: string) => {
    const current = form.benefit_ids || [];
    setFieldValue("benefit_ids", current.includes(benefitId) ? current.filter((item) => item !== benefitId) : [...current, benefitId]);
  };

  const saveCurrentStep = async (continueAfterSave = false) => {
    let saved = false;
    if (activeStep === "commercial") {
      saved = onSubmit("commercial");
    } else if (activeStep === "marketing") {
      saved = await saveMarketing();
    } else {
      if (!validateForm(activeStep === "web" ? "web" : "complete")) return;
      if (form.sales_status === "ON_SALE" && !requirements.canSell) {
        toast.error("No puedes poner este producto en venta todavía");
        setActiveStep("review");
        return;
      }
      if (form.sales_status === "PUBLISHED" && !requirements.canPublish) {
        toast.error("Completa los requisitos antes de publicar el producto");
        setActiveStep("review");
        return;
      }
      saved = await saveWebContent();
    }

    if (saved && continueAfterSave && id) {
      const target = nextStep();
      if (target) setActiveStep(target);
    } else if (saved && continueAfterSave && activeStep === "commercial" && isEdit) {
      const target = nextStep();
      if (target) setActiveStep(target);
    }
  };

  const handleSaveDraft = async () => {
    if (activeStep === "commercial") {
      onSubmit("commercial");
      return;
    }
    setFieldValue("sales_status", "DRAFT");
    await saveDraftContent();
  };

  const isSaving = isPending || isSavingMarketing || isSavingWeb;
  const finalActionLabel = form.sales_status === "ON_SALE" ? "Poner en venta" : form.sales_status === "PUBLISHED" ? "Publicar producto" : "Guardar cambios";
  const finalActionDisabled = (form.sales_status === "ON_SALE" && !requirements.canSell) || (form.sales_status === "PUBLISHED" && !requirements.canPublish);

  if (isEdit && isLoadingProduct) {
    return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3"><Loader2 className="h-9 w-9 animate-spin text-primary" /><p className="text-sm font-semibold text-slate-500">Cargando producto...</p></div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-3 pb-28 sm:px-4">
      <ProductFormHeader
        isEdit={isEdit}
        name={form.name}
        status={form.sales_status}
        progress={requirements.progress}
        pendingCount={requirements.pendingCount}
        onBack={() => navigate("/productos")}
        actions={<ProductFormActions isSaving={isSaving} readonly={permissions.readonly} isLastStep={activeStep === "review"} primaryLabel={activeStep === "review" ? finalActionLabel : undefined} primaryDisabled={activeStep === "review" && finalActionDisabled} onSaveDraft={handleSaveDraft} onContinue={() => saveCurrentStep(true)} />}
      />

      <ProductFormStepper steps={visibleSteps} activeStep={activeStep} states={stepStates} onStepChange={handleStepChange} />

      {permissions.readonly && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">Modo de lectura activo. Puedes revisar la completitud, pero tu rol no permite guardar cambios.</div>}

      {activeStep === "commercial" && <ProductCommercialSection form={form} errors={errors} setFieldValue={setFieldValue} setPriceValue={setPriceValue} editions={editions} categories={categories} isLoadingEditions={isLoadingEditions} isLoadingCategories={isLoadingCategories} isEditionsError={isEditionsError} isCategoriesError={isCategoriesError} selectedEdition={selectedEdition} isEdit={isEdit} disabled={permissions.readonly || !permissions.canEditAll} />}
      {activeStep === "marketing" && <ProductMarketingSection form={form} errors={errors} setFieldValue={setFieldValue} availableBenefits={availableBenefits} isLoadingBenefits={isLoadingBenefits} isBenefitsError={isBenefitsError} onToggleBenefit={handleToggleBenefit} isUploadingCover={isUploading} onCoverUpload={handleImageUpload} isUploadingBrochure={isUploadingBrochure} onBrochureFileChange={handleBrochureFileChange} onRemoveBrochure={() => setFieldValue("brochure_url", "")} onLoadDefaultFAQs={handleLoadDefaultFAQs} disabled={permissions.readonly} />}
      {activeStep === "web" && <ProductWebContentSection form={form} errors={errors} setFieldValue={setFieldValue} requirements={[...requirements.sections.commercial, ...requirements.sections.marketing.filter((item) => item.id === "benefit_ids"), ...requirements.sections.web]} disabled={permissions.readonly} />}
      {activeStep === "review" && <ProductReviewSummary form={form} requirements={requirements} />}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl justify-end"><ProductFormActions isSaving={isSaving} readonly={permissions.readonly} isLastStep={activeStep === "review"} primaryLabel={activeStep === "review" ? finalActionLabel : undefined} primaryDisabled={activeStep === "review" && finalActionDisabled} onSaveDraft={handleSaveDraft} onContinue={() => saveCurrentStep(true)} /></div>
      </div>
    </div>
  );
};

export default ProductFormView;
