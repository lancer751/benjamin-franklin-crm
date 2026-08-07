import { api } from "@/core/lib/api";
import { PaymentApiError } from "./paymentService";

export interface PaymentSchedulePayload {
  start_date: string;
  installments: Array<{ due_date: string; due_amount: string }>;
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as unknown;
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
      ? body.message
      : "No se pudo guardar el cronograma";
    throw new PaymentApiError(response.status, message);
  }
  return body as T;
}

const scheduleEndpoint = (orderId: string, detailId: string) =>
  api.orders[":id"].details[":detailId"].schedule;

export async function createPaymentSchedule(orderId: string, detailId: string, payload: PaymentSchedulePayload) {
  const response = await scheduleEndpoint(orderId, detailId).$post({
    param: { id: orderId, detailId },
    json: payload,
  });
  return readResponse(response);
}

export async function updatePaymentSchedule(orderId: string, detailId: string, payload: PaymentSchedulePayload) {
  const response = await scheduleEndpoint(orderId, detailId).$put({
    param: { id: orderId, detailId },
    json: payload,
  });
  return readResponse(response);
}

export async function deletePaymentSchedule(orderId: string, detailId: string) {
  const response = await scheduleEndpoint(orderId, detailId).$delete({ param: { id: orderId, detailId } });
  return readResponse(response);
}
