import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// TIPOS INFERIDOS DESDE EL BACKEND

type PaymentsRes = InferResponseType<typeof api.payments.$get>;
type CreatePaymentReq = InferRequestType<typeof api.payments.manual.$post>["json"];
type CreatePaymentRes = InferResponseType<typeof api.payments.manual.$post>;

// SERVICIOS DE PAGOS

export const getPayments = async (): Promise<PaymentsRes> => {
  const res = await api.payments.$get();
  return await res.json();
};


export const createManualPayment = async (data: CreatePaymentReq): Promise<CreatePaymentRes> => {
  const res = await api.payments.manual.$post({ json: data });
  return await res.json();
};