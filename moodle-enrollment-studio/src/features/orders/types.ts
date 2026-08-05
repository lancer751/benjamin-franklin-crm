export type AttendanceMode = "VIRTUAL" | "PRESENCIAL" | "HEREDADO";
export type PaymentModality = "FULL" | "INSTALLMENTS";
export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
export type OrderCreationOrder = "asc" | "desc";

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  order_status?: OrderStatus;
  member_id?: string;
  generated_by?: string;
  creation_order?: OrderCreationOrder;
}

export interface OrderPhone {
  number: string;
  type?: string;
  isPrincipal?: boolean;
}

export interface OrderLeadSummary {
  id: string;
  first_name: string | null;
  middle_name?: string | null;
  last_name: string | null;
  email: string | null;
  lead_status?: "ACTIVE" | "INACTIVE";
  dni?: string | null;
  profession?: string | null;
  gender?: string | null;
  address?: string | null;
  second_address?: string | null;
  created_at?: string;
  phones?: OrderPhone[];
}

export interface OrderProductPrice {
  attendance_mode: AttendanceMode;
  cash_price: string | number;
  installment_price?: string | number | null;
  enrollment_fee?: string | number | null;
}

export interface OrderProduct {
  id: string;
  name: string;
  sales_status: string;
  pricing_status?: string;
  image_url?: string | null;
  prices: OrderProductPrice[];
  edition?: {
    edition_code?: string | null;
    modality?: string | null;
  } | null;
}

export interface OrderDetailResponse {
  id?: string;
  product_id: string;
  price: string | number;
  discount_code: string | null;
  created_at?: string;
  updated_at?: string;
  // The current backend does not return this field. Keeping it optional lets
  // the UI enable safe item editing if the API later exposes the source mode.
  attendance_mode?: AttendanceMode;
  payment_modality?: PaymentModality;
  product: {
    id: string;
    name: string;
    slug?: string;
    description?: string | null;
    short_description?: string | null;
    image_url?: string | null;
    brochure_url?: string | null;
    sales_status?: string;
    pricing_status?: string;
    installments_min_number?: number | null;
    installments_max_number?: number | null;
    category?: { name?: string | null } | null;
  };
  paymentPlan?: OrderPaymentPlan | null;
}

export interface OrderDisplayItem {
  productId: string;
  productName: string;
  categoryName: string;
  imageUrl: string | null;
  basePrice: string;
  discountAmount: string;
  finalPrice: string;
  paymentModality: PaymentModality | null;
  discountCode: string | null;
  paymentPlan: OrderPaymentPlan | null;
}

export interface OrderInstallment {
  id?: string;
  number: number;
  due_date: string;
  due_amount: string | number;
  status: string;
}

export interface OrderPayment {
  id?: string;
  amount: string | number;
  payment_method: string;
  payment_date: string;
  payment_status?: string;
  type?: string;
  currency?: string | null;
  transaccion_id?: string | null;
  payment_receipt?: string | null;
}

export interface OrderPaymentPlan {
  id?: string;
  total_installments: number;
  total_amount: string | number;
  start_date: string;
  status: string;
  installments: OrderInstallment[];
}

export interface OrderSeller {
  id: string;
  sales_target?: number;
  total_orders?: number;
  completed_orders?: number;
  canceled_orders?: number;
  user?: {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    corporate_email?: string | null;
    is_active?: boolean;
  } | null;
}

export interface OrderResponse {
  id: string;
  orderCode: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  subtotal: string;
  discountAmount: string;
  total: string;
  member_id: string;
  memberId: string;
  lead_id?: string;
  leadId: string;
  leadName: string;
  campaignId: string;
  assignedUserName: string;
  creatorName: string;
  generated_by?: string | null;
  sub_total: string | number;
  total_amount: string | number;
  discount?: string | number | null;
  order_status: OrderStatus;
  order_code: string;
  created_at: string;
  updated_at: string;
  lead: OrderLeadSummary;
  member: {
    id: string;
    campaignId: string;
    lead: OrderLeadSummary;
  };
  userCreator?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  assignedUser?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  orderDetails: OrderDetailResponse[];
  items: OrderDisplayItem[];
  paymentPlan: OrderPaymentPlan | null;
  paymentPlans?: OrderPaymentPlan[];
  payments?: OrderPayment[];
  seller?: OrderSeller | null;
}

export interface OrderFormItem {
  product_id: string;
  attendance_mode: AttendanceMode | "";
  payment_modality: PaymentModality | "";
  discount_code: string | null;
}

export interface OrderFormValues {
  leadId: string;
  assigned_to: string;
  discount: string;
  order_items: OrderFormItem[];
  order_status?: OrderStatus;
}

export interface CreateOrderItemPayload {
  product_id: string;
  attendance_mode: AttendanceMode;
  payment_modality: PaymentModality;
  discount_code?: string;
}

export interface CreateOrderPayload {
  member_id: string;
  related_campaign: string;
  assigned_to?: string;
  order_items: CreateOrderItemPayload[];
}

export interface OrderMatriculatedCampaign {
  memberId: string;
  campaignId: string;
  campaignName: string;
  platform: string;
  assignedUserId: string;
  assignedUserName: string;
  isPrimary: boolean;
  status: "MATRICULADO";
  associatedAt: string | null;
}

export interface OrderLeadContext {
  leadId: string;
  fullName: string;
  phone: string;
  email: string;
  matriculatedCampaigns: OrderMatriculatedCampaign[];
  hasUnavailableMatriculatedCampaign: boolean;
}

export interface OrderCreationSubmissionContext {
  campaign: OrderMatriculatedCampaign;
}

export interface UpdateOrderPayload {
  order_status?: OrderStatus;
  assigned_to?: string;
  order_items?: CreateOrderItemPayload[];
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export type OrderListResponse = ApiSuccess<{
  orders: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}>;

export interface OrderListItem {
  id: string;
  memberId: string;
  leadId: string;
  campaignId: string;
  orderCode: string;
  status: OrderStatus;
  subtotal: string;
  totalAmount: string;
  discount: string;
  createdAt: string;
  lead: {
    fullName: string;
    email: string | null;
    dni: string | null;
  };
  seller: {
    fullName: string;
    email: string | null;
    initials: string;
  } | null;
  creator: {
    fullName: string;
  } | null;
  products: Array<{
    name: string;
    price: string;
  }>;
}

export interface MappedOrderForm {
  values: OrderFormValues;
  canEditItems: boolean;
  limitation?: string;
}
