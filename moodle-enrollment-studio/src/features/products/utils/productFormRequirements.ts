import type { ProductFormValues } from "../schemas";

export type ProductFormStepId = "commercial" | "marketing" | "web" | "review";
export type RequirementState = "complete" | "pending" | "error" | "optional";

export interface ProductRequirement {
  id: string;
  label: string;
  state: RequirementState;
}

const filled = (value: unknown) => typeof value === "string" && value.trim().length > 0;
const validPrices = (form: ProductFormValues) =>
  form.prices.length > 0 &&
  form.prices.every((price) =>
    Number(price.cash_price) >= 0 &&
    Number(price.installment_price) >= Number(price.cash_price) &&
    Number(price.enrollment_fee) >= 0,
  );

export const getProductRequirements = (form: ProductFormValues) => {
  const commercial: ProductRequirement[] = [
    { id: "edition_id", label: "Edición seleccionada", state: form.edition_id ? "complete" : "pending" },
    { id: "category_id", label: "Categoría seleccionada", state: form.category_id ? "complete" : "pending" },
    { id: "name", label: "Nombre comercial", state: filled(form.name) ? "complete" : "pending" },
    { id: "prices", label: "Precios válidos", state: validPrices(form) ? "complete" : "error" },
    {
      id: "installments",
      label: "Rango de cuotas válido",
      state: form.installments_max_number >= form.installments_min_number ? "complete" : "error",
    },
    {
      id: "discount_expires_at",
      label: "Vencimiento del descuento",
      state: Number(form.discount_price || 0) <= 0 ? "optional" : form.discount_expires_at ? "complete" : "error",
    },
  ];

  const marketing: ProductRequirement[] = [
    { id: "image_url", label: "Portada cargada", state: form.image_url ? "complete" : "optional" },
    { id: "brochure_url", label: "Brochure cargado", state: form.brochure_url ? "complete" : "optional" },
    { id: "certification", label: "Certificación vinculada", state: form.certification_id || form.certifications?.length ? "complete" : "optional" },
    { id: "benefit_ids", label: "Beneficio asociado", state: form.benefit_ids.length > 0 ? "complete" : "pending" },
    { id: "faqs", label: "Preguntas frecuentes", state: form.faqs.length > 0 ? "complete" : "optional" },
  ];

  const publicationRequired = form.sales_status === "PUBLISHED" || form.sales_status === "ON_SALE";
  const web: ProductRequirement[] = [
    { id: "slug", label: "Slug válido", state: filled(form.slug) ? "complete" : "pending" },
    {
      id: "short_description",
      label: "Descripción corta",
      state: filled(form.short_description) ? "complete" : publicationRequired ? "error" : "pending",
    },
    {
      id: "description",
      label: "Descripción detallada",
      state: filled(form.description) ? "complete" : publicationRequired ? "error" : "pending",
    },
    {
      id: "pricing_status",
      label: "Estado de precios válido",
      state: form.pricing_status === "VALID" ? "complete" : "error",
    },
  ];

  const all = [...commercial, ...marketing, ...web];
  const required = all.filter((item) => item.state !== "optional");
  const completed = required.filter((item) => item.state === "complete").length;
  const missingForPublication = [...commercial, ...marketing.filter((item) => item.id === "benefit_ids"), ...web]
    .filter((item) => item.state !== "complete" && item.state !== "optional");

  return {
    sections: { commercial, marketing, web },
    progress: required.length ? Math.round((completed / required.length) * 100) : 0,
    pendingCount: required.length - completed,
    canPublish: missingForPublication.length === 0,
    canSell: missingForPublication.length === 0 && form.pricing_status === "VALID",
    missingForPublication,
  };
};

export type ProductRequirements = ReturnType<typeof getProductRequirements>;

export const getStepState = (
  requirements: ProductRequirements,
  step: ProductFormStepId,
): "complete" | "pending" | "not-started" | "error" => {
  if (step === "review") return requirements.pendingCount === 0 ? "complete" : "pending";
  const items = requirements.sections[step === "web" ? "web" : step];
  if (items.some((item) => item.state === "error")) return "error";
  const required = items.filter((item) => item.state !== "optional");
  if (required.every((item) => item.state === "complete")) return "complete";
  if (required.every((item) => item.state === "pending")) return "not-started";
  return "pending";
};
