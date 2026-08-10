export type PaymentMethod =
  | "YAPE"
  | "ONLINE"
  | "POS"
  | "CASH"
  | "BANK_TRANSFER";

export type PaymentStatus = "PENDING" | "CONFIRMED" | "FAILED" | "REFUNDED";
export type PaymentReviewStatus = "CONFIRMED" | "FAILED";
export type PaymentType = "FULL" | "INSTALLMENTS";
export type ScheduledPaymentStatus = "PAID" | "OVERDUE" | "PENDING";

export interface PaymentPersonResponse {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
}

export interface PaymentLeadResponse extends PaymentPersonResponse {
  email?: string | null;
  dni?: string | null;
}

export interface ScheduledPaymentResponse {
  id: string;
  due_date: string;
  due_amount: string | number;
  number: number;
  status: ScheduledPaymentStatus;
  payment_plan_id?: string;
  created_at?: string;
  updated_at?: string;
  payment_plan?: {
    orderDetail?: PaymentOrderDetailResponse | null;
  };
}

export interface PaymentPlanResponse {
  id: string;
  order_detail_id: string;
  total_installments: number;
  total_amount: string | number;
  start_date: string;
  status: "COMPLETED" | "PENDING" | "CANCELLED";
  installments?: ScheduledPaymentResponse[];
}

export interface PaymentOrderResponse {
  id: string;
  order_code?: string | null;
  total_amount: string | number;
  member?: {
    id?: string;
    campaing_id?: string;
    lead?: PaymentLeadResponse | null;
  } | null;
}

export interface PaymentOrderDetailResponse {
  id: string;
  product?: {
    id: string;
    name: string;
    enrollment_fee?: string | number | null;
  } | null;
}

export interface PaymentResponse {
  id: string;
  order_id: string;
  order_detail_id?: string | null;
  scheduled_payment_id?: string | null;
  payment_date: string;
  amount: string | number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  type: PaymentType;
  currency?: string | null;
  transaccion_id?: string | null;
  payment_receipt: string;
  created_at: string;
  updated_at: string;
  order?: PaymentOrderResponse | null;
  schedulePayment?: ScheduledPaymentResponse | null;
  orderDetail?: PaymentOrderDetailResponse | null;
  creator?: PaymentPersonResponse | null;
  reviewer?: PaymentPersonResponse | null;
}

export interface PaymentListItem {
  id: string;
  transactionId: string | null;
  orderId: string;
  orderCode: string | null;
  orderDetailId: string | null;
  scheduledPaymentId: string | null;
  clientName: string;
  productName: string;
  installmentLabel: string | null;
  method: PaymentMethod;
  status: PaymentStatus;
  type: PaymentType;
  amount: string;
  currency: string;
  paymentDate: string;
  createdAt: string;
  registeredBy: string;
  reviewedBy: string | null;
}

export interface PaymentDetail extends PaymentListItem {
  updatedAt: string;
  receiptKey: string;
  scheduledPayment: ScheduledPaymentResponse | null;
}

export interface CreatePaymentPayload {
  order_id: string;
  payment_date: string;
  amount: string;
  payment_method: PaymentMethod;
  currency: string;
  transaccion_id?: string;
  payment_receipt: string;
  target:
    | { type: "SCHEDULED_INSTALLMENT"; scheduled_payment_id: string }
    | { type: "FULL_CASH"; order_detail_id: string };
}

export interface UpdatePaymentStatusPayload {
  payment_status: PaymentReviewStatus;
}

export interface PaymentListFilters {
  page?: number;
  limit?: number;
  order_id?: string;
  payment_status?: PaymentStatus;
}

export interface EvidenceUploadRequest {
  file_name: string;
  content_type: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
}

export interface EvidenceUploadData {
  url: string;
  fields: Record<string, string>;
  key: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export type PaymentsResponse = ApiSuccess<{
  payments: PaymentResponse[];
  total: number;
  page: number;
  limit: number;
}>;
export type PaymentDetailResponse = ApiSuccess<PaymentResponse>;
