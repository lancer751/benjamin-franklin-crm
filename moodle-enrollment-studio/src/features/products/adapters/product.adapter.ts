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

  // ✅ CORREGIDO: Mapeo directo desde el objeto del beneficio (viene aplanado)
  const benefits = (data.relatedBenefits || []).map((rb) => ({
    id: rb.id || rb.benefit_id || "",
    description: rb.description || "",
    name: rb.name || "",
    icon_name: rb.icon_name || "",
  }));

  // ✅ CORREGIDO: Mapeo directo desde el objeto raíz de la FAQ
  const faqs = (data.frequentQuestions || []).map((fq) => ({
    id: fq.id || "",
    question: fq.question || "",
    answer: fq.answer || "",
  }));

  // ✅ CORREGIDO: Lee los datos directamente desde el primer elemento del array
  const cert = data.relatedCertifications?.[0];
  const certification = cert
    ? {
        id: cert.id || "",
        title: cert.title || "",
        description: cert.description || "",
        imageUrl: cert.image_url || "",
        issuingAuthority: cert.issuing_authority || "Corporación Educativa Benjamin Franklin",
        registryValidity: cert.registry_validity || "",
        hasDigital: !!cert.has_digital,
        hasPhysical: !!cert.has_physical,
      }
    : null;

  return {
    id: data.id || "",
    name: data.name || "",
    slug: data.slug || "",
    sales_status: data.sales_status || "DRAFT",
    image_url: data.image_url || "",
    short_description: data.short_description || "",
    description: data.description || "",
    presale_price: data.presale_price != null ? String(data.presale_price) : "",
    discount_price: data.discount_price != null ? String(data.discount_price) : "",
    discount_expires_at: data.discount_expires_at || "",
    brochure_url: data.brochure_url || "",
    installments_min_number: data.installments_min_number != null ? Number(data.installments_min_number) : 1,
    installments_max_number: data.installments_max_number != null ? Number(data.installments_max_number) : 1,
    category,
    edition,
    prices,
    benefits,
    faqs,
    certification,
  };
};