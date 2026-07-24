export type PaymentMethod =
  | "YAPE"
  | "ONLINE"
  | "POS"
  | "CASH"
  | "BANK_TRANSFER";

export type PaymentStatus = "CONFIRMED" | "REFUNDED" | "FAILED";
export type PaymentType = "FULL" | "INSTALLMENTS";
export type ScheduledPaymentStatus = "PAID" | "OVERDUE" | "PENDING";

export interface PaymentLeadResponse {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  dni?: string | null;
}

export interface ScheduledPaymentResponse {
  id: string;
  due_date: string;
  due_amount: string | number;
  number: number;
  status: ScheduledPaymentStatus;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentPlanResponse {
  id: string;
  order_id: string;
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
  order_status?: string;
  lead?: PaymentLeadResponse | null;
  paymentPlans?: PaymentPlanResponse[];
}

export interface PaymentResponse {
  id: string;
  order_id: string;
  scheduled_payment_id?: string | null;
  payment_date: string;
  amount: string | number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  type: PaymentType;
  currency: string;
  transaccion_id?: string | null;
  created_at: string;
  updated_at: string;
  order?: PaymentOrderResponse | null;
  schedulePayment?: ScheduledPaymentResponse | null;
}

export interface PaymentListItem {
  id: string;
  transactionId: string | null;
  orderId: string;
  orderCode: string | null;
  orderTotal: string;
  client: {
    fullName: string;
    email: string | null;
    dni: string | null;
  };
  method: PaymentMethod;
  status: PaymentStatus;
  type: PaymentType;
  amount: string;
  currency: string;
  paymentDate: string;
  createdAt: string;
}

export interface PaymentDetail extends PaymentListItem {
  updatedAt: string;
  scheduledPayment: ScheduledPaymentResponse | null;
  paymentPlans: PaymentPlanResponse[];
}

export interface ScheduledPaymentFormValue {
  number: number;
  dueDate: string;
  dueAmount: string;
}

export interface PaymentPlanFormValues {
  totalInstallments: string;
  totalAmount: string;
  startDate: string;
  scheduledPayments: ScheduledPaymentFormValue[];
}

export interface PaymentFormValues {
  orderId: string;
  paymentDate: string;
  amount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  type: PaymentType;
  currency: string;
  transactionId: string;
  paymentPlan: PaymentPlanFormValues;
}

export interface CreatePaymentPayload {
  order_id: string;
  payment_date: string;
  amount: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  type: PaymentType;
  currency: string;
  transaccion_id: string | null;
  payment_plan?: {
    order_id: string;
    total_installments: number;
    total_amount: string;
    start_date: string;
    scheduled_payments: Array<{
      due_date: string;
      due_amount: string;
      number: number;
    }>;
  };
}

export interface PaymentEditFormValues {
  paymentDate: string;
  transactionId: string;
  currency: string;
}

export interface UpdatePaymentPayload {
  payment_date?: string;
  transaccion_id?: string | null;
  currency?: string;
}

export interface UpdatePaymentStatusPayload {
  payment_status: PaymentStatus;
}

export interface PaymentOrderOption {
  id: string;
  code: string;
  status: string;
  totalAmount: string;
  confirmedPaid: number;
  remainingBalance: number;
  clientName: string;
  clientEmail: string | null;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export type PaymentsResponse = ApiSuccess<PaymentResponse[]>;
export type PaymentDetailResponse = ApiSuccess<PaymentResponse>;
