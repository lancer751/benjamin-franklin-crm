export type AttendanceMode = "VIRTUAL" | "PRESENCIAL" | "HEREDADO";
export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

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
  phones?: OrderPhone[];
}

export interface OrderProductPrice {
  attendance_mode: AttendanceMode;
  cash_price: string | number;
  installment_price?: string | number;
  enrollment_fee?: string | number;
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
  id: string;
  product_id: string;
  price: string | number;
  discount_code: string | null;
  // The current backend does not return this field. Keeping it optional lets
  // the UI enable safe item editing if the API later exposes the source mode.
  attendance_mode?: AttendanceMode;
  product: {
    id: string;
    name: string;
    sales_status?: string;
    edition?: {
      edition_code?: string | null;
      course?: { name?: string | null } | null;
    } | null;
    category?: { name?: string | null } | null;
  };
}

export interface OrderInstallment {
  installment_number: number;
  due_date: string;
  amount: string | number;
  status: string;
}

export interface OrderPayment {
  amount: string | number;
  payment_method: string;
  payment_date: string;
  payment_status?: string;
}

export interface OrderResponse {
  id: string;
  lead_id: string;
  generated_by?: string | null;
  sub_total: string | number;
  total_amount: string | number;
  discount?: string | number | null;
  order_status: OrderStatus;
  order_code: string;
  created_at: string;
  updated_at: string;
  lead: OrderLeadSummary;
  orderDetails: OrderDetailResponse[];
  paymentPlans?: Array<{ installments: OrderInstallment[] }>;
  payments?: OrderPayment[];
  seller?: {
    user?: {
      first_name?: string | null;
      last_name?: string | null;
    } | null;
  } | null;
}

export interface OrderFormItem {
  product_id: string;
  attendance_mode: AttendanceMode | "";
  discount_code: string | null;
}

export interface OrderFormValues {
  lead_id: string;
  discount: string;
  order_items: OrderFormItem[];
  order_status?: OrderStatus;
}

export interface CreateOrderItemPayload {
  product_id: string;
  attendance_mode: AttendanceMode;
  discount_code: string | null;
}

export interface CreateOrderPayload {
  lead_id: string;
  discount?: string;
  order_items: CreateOrderItemPayload[];
}

export interface UpdateOrderPayload {
  discount?: string;
  order_status?: OrderStatus;
  order_items?: CreateOrderItemPayload[];
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface MappedOrderForm {
  values: OrderFormValues;
  canEditItems: boolean;
  limitation?: string;
}
