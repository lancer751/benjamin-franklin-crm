import type { CreateProductInput } from "../services/productService";
import type { ProductFormValues } from "../schemas";
import {
  BackendProductResponse,
  ProductAssignedProfessor,
  UIProduct,
} from "../types/product.types";

export const getActiveProfessorNames = (
  assignedProfessors: ProductAssignedProfessor[] | null | undefined,
): string[] =>
  (assignedProfessors ?? []).flatMap(({ professors }) => {
    if (!professors?.is_active) return [];

    const fullName = [professors.name, professors.lastname]
      .filter((name): name is string => Boolean(name?.trim()))
      .join(" ");

    return fullName ? [fullName] : [];
  });

export const getAssignedProfessorsLabel = (
  assignedProfessors: ProductAssignedProfessor[] | null | undefined,
): string => {
  const professorNames = getActiveProfessorNames(assignedProfessors);

  return professorNames.length > 0
    ? professorNames.join(" · ")
    : "Profesor por asignar";
};

export const adaptProductToUI = (data: BackendProductResponse): UIProduct => {
  const category = data.category
    ? {
        id: data.category.id || "",
        name: data.category.name || "",
      }
    : null;

  const edition = data.edition
    ? {
        id: data.edition.id || "",
        edition_code: data.edition.edition_code || "",
        edition_number: data.edition.edition_number != null ? Number(data.edition.edition_number) : undefined,
        edition_status: data.edition.edition_status || "",
        teacher_fullname: data.edition.teacher_fullname || "",
        modality: data.edition.modality || "",
        start_date: data.edition.start_date || "",
        end_date: data.edition.end_date || "",
        duration_value: data.edition.duration_value != null ? Number(data.edition.duration_value) : null,
        duration_unit: data.edition.duration_unit || "",
        classes_number: data.edition.classes_number != null ? Number(data.edition.classes_number) : null,
        hours_amount: data.edition.hours_amount != null ? Number(data.edition.hours_amount) : null,
        assigned_professors: data.edition.assigned_professors ?? null,
        course: data.edition.course
          ? {
              id: data.edition.course.id || "",
              name: data.edition.course.name || "",
            }
          : null,
      }
    : null;

  const prices = (data.prices || []).map((p) => ({
    attendance_mode: p.attendance_mode,
    cash_price: String(p.cash_price || "0.00"),
    installment_price: String(p.installment_price || "0.00"),
  }));

  // ✅ CORREGIDO: Mapeo directo y defensivo compatible con Prisma anidado
  const benefits = (data.relatedBenefits || []).map((rb) => ({
    id: rb.benefits?.id || rb.benefit?.id || rb.id || rb.benefit_id || "",
    description: rb.benefits?.description || rb.benefit?.description || rb.description || "",
    name: rb.benefits?.name || rb.benefit?.name || rb.name || "",
    icon_name: rb.benefits?.icon_name || rb.benefit?.icon_name || rb.icon_name || "",
  }));

  // ✅ CORREGIDO: Mapeo de FAQs compatible con Prisma anidado
  const faqs = (data.frequentQuestions || []).map((fq) => ({
    id: fq.faq?.id || fq.id || fq.faq_id || "",
    question: fq.faq?.question || fq.question || "",
    answer: fq.faq?.answer || fq.answer || "",
  }));

  // ✅ CORREGIDO: Mapeo de Certificación compatible con Prisma anidado
  const certObj = data.relatedCertifications?.[0]?.certification || data.relatedCertifications?.[0];
  const certification = certObj
    ? {
        id: certObj.id || "",
        title: certObj.title || "",
        description: certObj.description || "",
        imageUrl: certObj.image_url || certObj.imageUrl || "",
        issuingAuthority: certObj.issuing_authority || certObj.issuingAuthority || "Corporación Educativa Benjamin Franklin",
        registryValidity: certObj.registry_validity || certObj.registryValidity || "",
        hasDigital: !!(certObj.has_digital ?? certObj.hasDigital ?? true),
        hasPhysical: !!(certObj.has_physical ?? certObj.hasPhysical ?? true),
      }
    : null;

  return {
    id: data.id || "",
    name: data.name || "",
    updated_at: data.updated_at || "",
    slug: data.slug || "",
    sales_status: data.sales_status || "DRAFT",
    pricing_status: data.pricing_status || "VALID",
    image_url: data.image_url || "",
    short_description: data.short_description || "",
    description: data.description || "",
    presale_price: data.presale_price != null ? String(data.presale_price) : "",
    enrollment_fee: data.enrollment_fee != null ? String(data.enrollment_fee) : "0.00",
    discount_price: data.discount_price != null ? String(data.discount_price) : "",
    discount_expires_at: data.discount_expires_at ? data.discount_expires_at.slice(0, 10) : "",
    brochure_url: data.brochure_url || "",
    installments_min_number: data.installments_min_number != null ? Number(data.installments_min_number) : 1,
    installments_max_number: data.installments_max_number != null ? Number(data.installments_max_number) : 1,
    category,
    edition,
    prices,
    benefits,
    faqs,
    certification,
    frequentQuestions: data.frequentQuestions,
    relatedBenefits: data.relatedBenefits,
    relatedCertifications: data.relatedCertifications,
  };
};

const parseOptionalAmount = (value: string | number | null | undefined) => {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
};

export const mapProductFormToPayload = (
  form: ProductFormValues,
  editionModality?: string,
): CreateProductInput => ({
  name: form.name,
  edition_id: form.edition_id,
  category_id: form.category_id,
  enrollment_fee: Number(form.enrollment_fee),
  installments_min_number: Number(form.installments_min_number),
  installments_max_number: Number(form.installments_max_number),
  discount_price: parseOptionalAmount(form.discount_price),
  discount_expires_at: form.discount_expires_at
    ? new Date(`${form.discount_expires_at}T00:00:00`).toISOString()
    : null,
  prices: form.prices.map((price) => ({
    attendance_mode: editionModality === "HIBRIDO" ? price.attendance_mode : "HEREDADO",
    cash_price: Number(price.cash_price),
    installment_price: Number(price.installment_price),
  })),
}) as CreateProductInput;
