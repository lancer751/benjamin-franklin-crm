import { api } from "@/core/lib/api";
import type {
  ApiSuccess,
  CreatePaymentPayload,
  EvidenceUploadData,
  EvidenceUploadRequest,
  PaymentDetailResponse,
  PaymentListFilters,
  PaymentResponse,
  PaymentsResponse,
  UpdatePaymentStatusPayload,
} from "../types";

interface ApiErrorBody {
  error?: string | { message?: string; name?: string };
  message?: string;
}

const apiErrorMessage = (body: unknown): string => {
  if (!body || typeof body !== "object") return "Error inesperado del servidor";
  const errorBody = body as ApiErrorBody;
  if (typeof errorBody.error === "string") return errorBody.error;
  if (errorBody.error && typeof errorBody.error.message === "string") return errorBody.error.message;
  return errorBody.message || "Error inesperado del servidor";
};

export class PaymentApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly serverMessage: string,
  ) {
    super(serverMessage);
    this.name = "PaymentApiError";
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as unknown;
  if (!response.ok) throw new PaymentApiError(response.status, apiErrorMessage(body));
  return body as T;
}

export function mapPaymentApiError(error: unknown): string {
  if (!(error instanceof PaymentApiError)) {
    return "No se pudo completar la operación. Inténtalo nuevamente.";
  }
  if (error.status === 403) return "No tienes permisos para registrar este pago.";
  if (error.status === 404) return "No se encontró la cuota o la orden.";
  if (error.status === 409 && error.serverMessage.includes("cuota")) {
    return "Esta cuota ya tiene un pago pendiente de validación.";
  }
  if (error.serverMessage.includes("monto") || error.serverMessage.includes("amount")) {
    return "El monto no coincide con el importe esperado.";
  }
  if (error.serverMessage.includes("No se puede cambiar")) return error.serverMessage;
  return error.serverMessage || "No se pudo completar la operación.";
}

export async function getPayments(filters: PaymentListFilters = {}): Promise<PaymentsResponse> {
  const query = {
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 100),
    ...(filters.order_id && { order_id: filters.order_id }),
    ...(filters.payment_status && { payment_status: filters.payment_status }),
  };
  const response = await api.payments.$get({ query });
  return readResponse<PaymentsResponse>(response);
}

export async function getPaymentById(id: string): Promise<PaymentDetailResponse> {
  const response = await api.payments[":id"].$get({ param: { id } });
  return readResponse<PaymentDetailResponse>(response);
}

export async function createPayment(payload: CreatePaymentPayload): Promise<ApiSuccess<PaymentResponse>> {
  const response = await api.payments.$post({ json: payload });
  return readResponse<ApiSuccess<PaymentResponse>>(response);
}

export async function requestEvidenceUpload(
  payload: EvidenceUploadRequest,
): Promise<EvidenceUploadData> {
  const response = await api.payments["evidence-upload-url"].$post({ json: payload });
  const body = await readResponse<ApiSuccess<EvidenceUploadData>>(response);
  return body.data;
}

export async function uploadEvidence(file: File, upload: EvidenceUploadData): Promise<void> {
  const form = new FormData();
  Object.entries(upload.fields).forEach(([key, value]) => form.append(key, value));
  form.append("file", file);
  const response = await fetch(upload.url, { method: "POST", body: form });
  if (!response.ok) throw new PaymentApiError(response.status, "No se pudo subir el comprobante");
}

export async function getPaymentReceiptUrl(id: string): Promise<string> {
  const response = await api.payments[":id"]["receipt-url"].$get({ param: { id } });
  const body = await readResponse<ApiSuccess<{ url: string }>>(response);
  return body.data.url;
}

export async function updatePaymentStatus(
  id: string,
  payload: UpdatePaymentStatusPayload,
): Promise<ApiSuccess<PaymentResponse>> {
  const response = await api.payments[":id"].status.$patch({ param: { id }, json: payload });
  return readResponse<ApiSuccess<PaymentResponse>>(response);
}

export async function deletePayment(id: string): Promise<{ success: true; message: string }> {
  const response = await api.payments[":id"].$delete({ param: { id } });
  return readResponse<{ success: true; message: string }>(response);
}
