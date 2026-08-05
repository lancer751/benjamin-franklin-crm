export type ProductSalesStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ON_SALE"
  | "COMPLETED"
  | "CANCELLED";

export interface ProductAssignedProfessor {
  professor_id: string;
  assignedAt?: string | null;
  professors?: {
    id: string;
    name?: string | null;
    lastname?: string | null;
    profession?: string | null;
    is_active?: boolean | null;
  } | null;
}

interface ProductBenefitReference {
  id?: string;
  name?: string;
  description?: string | null;
  icon_name?: string | null;
}

interface ProductFaqReference {
  id?: string;
  question?: string;
  answer?: string;
}

interface ProductCertificationReference {
  id?: string;
  title?: string;
  description?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  issuing_authority?: string | null;
  issuingAuthority?: string | null;
  registry_validity?: string | null;
  registryValidity?: string | null;
  has_digital?: boolean | null;
  hasDigital?: boolean | null;
  has_physical?: boolean | null;
  hasPhysical?: boolean | null;
}

export interface BackendProductResponse {
  id: string;
  name: string;
  updated_at?: string | null;
  slug?: string | null;
  sales_status: ProductSalesStatus;
  pricing_status?: "VALID" | "INVALID";
  image_url?: string | null;
  short_description?: string | null;
  description?: string | null;
  presale_price?: number | string | null;
  enrollment_fee?: number | string | null;
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
    edition_number?: number | null;
    edition_status?: string | null;
    teacher_fullname?: string | null;
    modality?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    duration_value?: number | null;
    duration_unit?: string | null;
    classes_number?: number | null;
    hours_amount?: number | null;
    course?: {
      id: string;
      name: string;
    } | null;
    assigned_professors?: ProductAssignedProfessor[] | null;
  } | null;
  prices?: {
    attendance_mode: "VIRTUAL" | "PRESENCIAL" | "HEREDADO";
    cash_price: number | string;
    installment_price: number | string;
  }[];
  relatedBenefits?: {
    id?: string;
    benefit_id: string;
    description?: string | null;
    name?: string;
    icon_name?: string | null;
    benefit?: ProductBenefitReference | null;
    benefits?: ProductBenefitReference | null;
  }[];
  frequentQuestions?: {
    id?: string;
    faq_id: string;
    question?: string;
    answer?: string;
    faq?: ProductFaqReference | null;
  }[];
  relatedCertifications?: {
    id?: string;
    certification_id: string;
    certification?: ProductCertificationReference | null;
    title?: string;
    description?: string | null;
    image_url?: string | null;
    imageUrl?: string | null;
    issuing_authority?: string | null;
    issuingAuthority?: string | null;
    registry_validity?: string | null;
    registryValidity?: string | null;
    has_digital?: boolean | null;
    hasDigital?: boolean | null;
    has_physical?: boolean | null;
    hasPhysical?: boolean | null;
  }[];
}

export interface UIProduct {
  id: string;
  name: string;
  updated_at: string;
  slug: string;
  sales_status: ProductSalesStatus;
  pricing_status: "VALID" | "INVALID";
  image_url: string;
  short_description: string;
  description: string;
  presale_price: string;
  enrollment_fee: string;
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
    edition_number?: number;
    edition_status?: string;
    teacher_fullname: string;
    modality: string;
    start_date: string;
    end_date: string;
    duration_value: number | null;
    duration_unit: string;
    classes_number: number | null;
    hours_amount: number | null;
    course: {
      id: string;
      name: string;
    } | null;
    assigned_professors?: ProductAssignedProfessor[] | null;
  } | null;
  prices: {
    attendance_mode: "VIRTUAL" | "PRESENCIAL" | "HEREDADO";
    cash_price: string;
    installment_price: string;
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
  frequentQuestions?: {
    faq_id: string;
    faq?: {
      id: string;
      question: string;
      answer: string;
      order?: number;
    } | null;
  }[];
  relatedBenefits?: {
    benefit_id: string;
    benefits?: {
      id: string;
      name: string;
      description?: string | null;
      icon_name?: string | null;
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
