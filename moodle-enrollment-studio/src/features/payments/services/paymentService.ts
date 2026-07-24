import { api } from "@/core/lib/api";
import type {
  ApiSuccess,
  CreatePaymentPayload,
  PaymentDetailResponse,
  PaymentResponse,
  PaymentsResponse,
  UpdatePaymentPayload,
  UpdatePaymentStatusPayload,
} from "../types";

interface ApiErrorBody {
  error?: string;
  message?: string;
}

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
  if (!response.ok) {
    const error = body as ApiErrorBody;
    throw new PaymentApiError(
      response.status,
      error.error || error.message || "Error inesperado del servidor",
    );
  }
  return body as T;
}

export function mapPaymentApiError(error: unknown): string {
  if (!(error instanceof PaymentApiError)) {
    return "No se pudo completar la operación. Inténtalo nuevamente.";
  }
  const message = error.serverMessage;
  if (message.includes("Order not found")) {
    return "La orden seleccionada no existe.";
  }
  if (message.includes("Payment not found")) {
    return "El pago no existe.";
  }
  if (message.includes("Payment would exceed")) {
    return "El pago confirmado supera el saldo pendiente de la orden.";
  }
  if (message.includes("Payment is already")) {
    return "El pago ya tiene ese estado.";
  }
  if (message.includes("Cannot change status of a REFUNDED")) {
    return "No se puede cambiar el estado de un pago reembolsado.";
  }
  if (message.includes("Cannot change status of a FAILED")) {
    return "No se puede cambiar el estado de un pago fallido.";
  }
  if (message.includes("Cannot delete confirmed")) {
    return "Los pagos confirmados no pueden eliminarse. Debes registrar un reembolso.";
  }
  return "No se pudo completar la operación. Revisa los datos e inténtalo nuevamente.";
}

export async function getPayments(): Promise<PaymentsResponse> {
  const response = await api.payments.$get();
  return readResponse<PaymentsResponse>(response);
}

export async function getPaymentById(
  id: string,
): Promise<PaymentDetailResponse> {
  const response = await api.payments[":id"].$get({ param: { id } });
  return readResponse<PaymentDetailResponse>(response);
}

export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<ApiSuccess<PaymentResponse>> {
  const response = await api.payments.$post({ json: payload });
  return readResponse<ApiSuccess<PaymentResponse>>(response);
}

export async function updatePayment(
  id: string,
  payload: UpdatePaymentPayload,
): Promise<ApiSuccess<PaymentResponse>> {
  const response = await api.payments[":id"].$put({
    param: { id },
    json: payload,
  });
  return readResponse<ApiSuccess<PaymentResponse>>(response);
}

export async function updatePaymentStatus(
  id: string,
  payload: UpdatePaymentStatusPayload,
): Promise<ApiSuccess<PaymentResponse>> {
  const response = await api.payments[":id"].status.$patch({
    param: { id },
    json: payload,
  });
  return readResponse<ApiSuccess<PaymentResponse>>(response);
}

export async function deletePayment(
  id: string,
): Promise<{ success: true; message: string }> {
  const response = await api.payments[":id"].$delete({ param: { id } });
  return readResponse<{ success: true; message: string }>(response);
}
