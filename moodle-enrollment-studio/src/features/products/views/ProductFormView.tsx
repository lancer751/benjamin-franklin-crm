import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getProductById } from "../services/productService";
import { useProductFormModal } from "../hooks/useProductFormModal";
import { useProductContentActions } from "../hooks/useProductContentActions";
import { usePendingProductFiles } from "../hooks/usePendingProductFiles";
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
import { productKeys } from "../queryKeys";

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
  const [createdProductId, setCreatedProductId] = useState<string>();
  const [savedSteps, setSavedSteps] = useState<Set<ProductFormStepId>>(() => new Set());
  const productId = id ?? createdProductId;
  const isCreationFlow = !id;

  const { data: productResponse, isLoading: isLoadingProduct } = useQuery({
    queryKey: productKeys.detail(id ?? ""),
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
    selectedEdition,
    isAsynchronous,
    isPending,
    handleLoadDefaultFAQs,
    availableBenefits,
    isLoadingBenefits,
    isBenefitsError,
  } = useProductFormModal(
    true,
    () => undefined,
    initialData,
    createdProductId,
  );

  const pendingFiles = usePendingProductFiles();

  const {
    saveMarketing,
    saveWebContent,
    isSavingMarketing,
    isSavingWeb,
    isUploadingFiles,
  } = useProductContentActions({ productId, form, setFieldValue, validateForm, pendingFiles });

  const requirements = useMemo(
    () => getProductRequirements(form, isAsynchronous),
    [form, isAsynchronous],
  );
  const visibleSteps = useMemo(() => {
    const allowed = new Set<ProductFormStepId>();
    if (permissions.allowedTabs.includes("general")) allowed.add("commercial");
    if (permissions.allowedTabs.includes("marketing")) allowed.add("marketing");
    if (permissions.allowedTabs.includes("commercial")) allowed.add("web");
    allowed.add("review");
    return ALL_STEPS.filter((step) => allowed.has(step.id));
  }, [permissions.allowedTabs]);

  const stepStates = useMemo(() => {
    const states = {
      commercial: getStepState(requirements, "commercial"),
      marketing: getStepState(requirements, "marketing"),
      web: getStepState(requirements, "web"),
      review: getStepState(requirements, "review"),
    };
    const errorFields = Object.keys(errors);
    const commercialFields = ["edition_id", "category_id", "name", "prices", "enrollment_fee", "installments", "discount", "pricing_status"];
    const marketingFields = ["image_url", "brochure_url", "benefit_ids", "faqs", "certification"];
    const webFields = ["slug", "short_description", "description", "sales_status"];
    if (errorFields.some((field) => commercialFields.some((prefix) => field.startsWith(prefix)))) states.commercial = "error";
    if (errorFields.some((field) => marketingFields.some((prefix) => field.startsWith(prefix)))) states.marketing = "error";
    if (errorFields.some((field) => webFields.some((prefix) => field.startsWith(prefix)))) states.web = "error";

    if (isCreationFlow) {
      (["commercial", "marketing", "web", "review"] as ProductFormStepId[]).forEach((step) => {
        if (states[step] === "complete" && !savedSteps.has(step)) states[step] = "pending";
      });
    }
    return states;
  }, [errors, isCreationFlow, requirements, savedSteps]);

  useEffect(() => {
    if (!visibleSteps.some((step) => step.id === activeStep)) setActiveStep(visibleSteps[0]?.id || "review");
  }, [activeStep, visibleSteps]);

  const nextStep = () => {
    const index = visibleSteps.findIndex((step) => step.id === activeStep);
    return visibleSteps[index + 1]?.id;
  };

  const handleStepChange = (step: ProductFormStepId) => {
    if (!productId && step !== "commercial") {
      toast.info("Crea primero el producto para continuar");
      return;
    }
    setActiveStep(step);
  };

  const handleToggleBenefit = (benefitId: string) => {
    const current = form.benefit_ids || [];
    setFieldValue("benefit_ids", current.includes(benefitId) ? current.filter((item) => item !== benefitId) : [...current, benefitId]);
  };

  const markStepSaved = (step: ProductFormStepId) => {
    setSavedSteps((current) => new Set(current).add(step));
  };

  const saveCurrentStep = async () => {
    if (isPending || isSavingMarketing || isSavingWeb || isUploadingFiles) return;
    let saved = false;
    if (activeStep === "commercial") {
      const response = await onSubmit();
      const savedProductId = response?.success ? response.data?.id : undefined;
      saved = Boolean(savedProductId);
      if (savedProductId && !productId) setCreatedProductId(savedProductId);
    } else if (activeStep === "marketing") {
      saved = await saveMarketing(isEdit ? "Cambios guardados" : undefined);
    } else {
      if (form.sales_status === "ON_SALE" && !requirements.canSell) {
        toast.error("No puedes poner este producto en venta todavía");
        return;
      }
      if (form.sales_status === "PUBLISHED" && !requirements.canPublish) {
        toast.error("Completa los requisitos antes de publicar el producto");
        return;
      }
      const successMessage = isEdit
        ? "Cambios guardados"
        : activeStep === "review" && form.sales_status === "PUBLISHED"
          ? "Producto publicado"
          : undefined;
      saved = await saveWebContent(activeStep === "web" ? "web" : "complete", successMessage);
    }

    if (!saved) return;
    markStepSaved(activeStep);
    if (isCreationFlow) {
      const target = nextStep();
      if (target) setActiveStep(target);
    }
  };

  const isSaving = isPending || isSavingMarketing || isSavingWeb || isUploadingFiles;
  const isInitialCreation = isCreationFlow && !productId;
  const isReviewStep = activeStep === "review";
  const actionLabel = isInitialCreation
    ? "Crear producto"
    : isEdit
      ? "Guardar cambios"
      : isReviewStep
        ? form.sales_status === "PUBLISHED"
          ? "Publicar producto"
          : form.sales_status === "ON_SALE"
            ? "Poner en venta"
            : "Guardar cambios"
        : "Guardar y continuar";
  const loadingLabel = isInitialCreation
    ? "Creando..."
    : isReviewStep && form.sales_status === "PUBLISHED"
      ? "Publicando..."
      : "Guardando...";
  const actionDisabled = isReviewStep && (
    (form.sales_status === "ON_SALE" && !requirements.canSell) ||
    (form.sales_status === "PUBLISHED" && !requirements.canPublish)
  );
  const renderFormActions = () => (
    <ProductFormActions
      isSaving={isSaving}
      readonly={permissions.readonly}
      label={actionLabel}
      loadingLabel={loadingLabel}
      disabled={actionDisabled}
      showContinueIcon={isCreationFlow && Boolean(productId) && !isReviewStep}
      onClick={saveCurrentStep}
    />
  );

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
        actions={renderFormActions()}
      />

      <ProductFormStepper steps={visibleSteps} activeStep={activeStep} states={stepStates} onStepChange={handleStepChange} />

      {permissions.readonly && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">Modo de lectura activo. Puedes revisar la completitud, pero tu rol no permite guardar cambios.</div>}

      {activeStep === "commercial" && <ProductCommercialSection form={form} errors={errors} setFieldValue={setFieldValue} setPriceValue={setPriceValue} editions={editions} isLoadingEditions={isLoadingEditions} isEditionsError={isEditionsError} selectedEdition={selectedEdition} isEdit={isEdit} isAsynchronous={isAsynchronous} disabled={permissions.readonly || !permissions.canEditAll} />}
      {activeStep === "marketing" && <ProductMarketingSection form={form} errors={errors} setFieldValue={setFieldValue} availableBenefits={availableBenefits} isLoadingBenefits={isLoadingBenefits} isBenefitsError={isBenefitsError} onToggleBenefit={handleToggleBenefit} pendingFiles={pendingFiles} isUploadingFiles={isUploadingFiles} onLoadDefaultFAQs={handleLoadDefaultFAQs} disabled={permissions.readonly} />}
      {activeStep === "web" && <ProductWebContentSection form={form} errors={errors} setFieldValue={setFieldValue} requirements={[...requirements.sections.commercial, ...requirements.sections.marketing.filter((item) => item.id === "benefit_ids"), ...requirements.sections.web]} disabled={permissions.readonly} />}
      {activeStep === "review" && <ProductReviewSummary form={form} requirements={requirements} />}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl justify-end">{renderFormActions()}</div>
      </div>
    </div>
  );
};

export default ProductFormView;
