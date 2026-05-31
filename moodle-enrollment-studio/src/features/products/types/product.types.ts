export interface BackendProductResponse {
  id: string;
  name: string;
  slug?: string | null;
  sales_status: "DRAFT" | "PUBLISHED" | "ON_SALE" | "COMPLETED" | "CANCELLED";
  image_url?: string | null;
  short_description?: string | null;
  description?: string | null;
  presale_price?: number | string | null;
  discount_price?: number | string | null;
  discount_expires_at?: string | null;
  brochure_url?: string | null;
  installments_min_number?: number | null;
  installments_max_number?: number | null;
  category?: {
    id: string;
    name: string;
  } | null;
  edition?: {
    id: string;
    edition_code?: string | null;
    teacher_fullname?: string | null;
    modality?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    duration_value?: number | null;
    duration_unit?: string | null;
    classes_number?: number | null;
    hours_amount?: number | null;
  } | null;
  prices?: {
    attendance_mode: "VIRTUAL" | "PRESENCIAL" | "HEREDADO";
    cash_price: number | string;
    installment_price: number | string;
    enrollment_fee: number | string;
  }[];
  relatedBenefits?: {
    benefit_id: string;
    description?: string | null;
    benefit?: {
      id: string;
      name: string;
      description?: string | null;
      icon_name?: string | null;
    } | null;
  }[];
  frequentQuestions?: {
    faq_id: string;
    faq?: {
      id: string;
      question: string;
      answer: string;
    } | null;
  }[];
  relatedCertifications?: {
    certification_id: string;
    certification?: {
      id: string;
      title: string;
      description?: string | null;
      image_url?: string | null;
      issuing_authority?: string | null;
      registry_validity?: string | null;
      has_digital?: boolean | null;
      has_physical?: boolean | null;
    } | null;
  }[];
}

export interface UIProduct {
  id: string;
  name: string;
  slug: string;
  sales_status: "DRAFT" | "PUBLISHED" | "ON_SALE" | "COMPLETED" | "CANCELLED";
  image_url: string;
  short_description: string;
  description: string;
  presale_price: string;
  discount_price: string;
  discount_expires_at: string;
  brochure_url: string;
  installments_min_number: number;
  installments_max_number: number;
  category: {
    id: string;
    name: string;
  } | null;
  edition: {
    id: string;
    edition_code: string;
    teacher_fullname: string;
    modality: string;
    start_date: string;
    end_date: string;
    duration_value: number | null;
    duration_unit: string;
    classes_number: number | null;
    hours_amount: number | null;
  } | null;
  prices: {
    attendance_mode: "VIRTUAL" | "PRESENCIAL" | "HEREDADO";
    cash_price: string;
    installment_price: string;
    enrollment_fee: string;
  }[];
  benefits: {
    id: string;
    description: string;
    name: string;
    icon_name: string;
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
  certification: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    issuingAuthority: string;
    registryValidity: string;
    hasDigital: boolean;
    hasPhysical: boolean;
  } | null;
}
