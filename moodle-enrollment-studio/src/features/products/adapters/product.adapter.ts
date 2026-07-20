import { BackendProductResponse, UIProduct } from "../types/product.types";

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
      }
    : null;

  const prices = (data.prices || []).map((p) => ({
    attendance_mode: p.attendance_mode,
    cash_price: String(p.cash_price || "0.00"),
    installment_price: String(p.installment_price || "0.00"),
    enrollment_fee: String(p.enrollment_fee || "0.00"),
  }));

  // ✅ CORREGIDO: Mapeo directo y defensivo compatible con Prisma anidado
  const benefits = (data.relatedBenefits || []).map((rb: any) => ({
    id: rb.benefits?.id || rb.benefit?.id || rb.id || rb.benefit_id || "",
    description: rb.benefits?.description || rb.benefit?.description || rb.description || "",
    name: rb.benefits?.name || rb.benefit?.name || rb.name || "",
    icon_name: rb.benefits?.icon_name || rb.benefit?.icon_name || rb.icon_name || "",
  }));

  // ✅ CORREGIDO: Mapeo de FAQs compatible con Prisma anidado
  const faqs = (data.frequentQuestions || []).map((fq: any) => ({
    id: fq.faq?.id || fq.id || fq.faq_id || "",
    question: fq.faq?.question || fq.question || "",
    answer: fq.faq?.answer || fq.answer || "",
  }));

  // ✅ CORREGIDO: Mapeo de Certificación compatible con Prisma anidado
  const certObj = (data.relatedCertifications?.[0]?.certification || data.relatedCertifications?.[0]) as any;
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
    slug: data.slug || "",
    sales_status: data.sales_status || "DRAFT",
    pricing_status: data.pricing_status || "VALID",
    image_url: data.image_url || "",
    short_description: data.short_description || "",
    description: data.description || "",
    presale_price: data.presale_price != null ? String(data.presale_price) : "",
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
