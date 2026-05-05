import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// ==========================================
// TIPOS INFERIDOS: PAGOS
// ==========================================

// El tipo de respuesta para obtener todos los pagos
type PaymentsRes = InferResponseType<typeof api.payments.$get>;

// El tipo para crear un pago (apunta a la raíz .post("/"))
type CreatePaymentReq = InferRequestType<typeof api.payments.$post>["json"];
type CreatePaymentRes = InferResponseType<typeof api.payments.$post>;

// El tipo para actualizar un pago
type UpdatePaymentReq = InferRequestType<typeof api.payments[":id"]["$put"]>["json"];

// ==========================================
// SERVICIOS: PAGOS
// ==========================================

/**
 * Obtiene la lista de todos los pagos registrados
 */
export const getPayments = async (): Promise<PaymentsRes> => {
  const res = await api.payments.$get();
  return await res.json();
};

/**
 * Crea un nuevo pago (Manual o de Cuotas)
 * Se eliminó el subfijo .manual porque el backend espera la ruta raíz "/"
 */
export const createPayment = async (data: CreatePaymentReq): Promise<CreatePaymentRes> => {
  // Cambiado de api.payments.manual.$post a api.payments.$post
  const res = await api.payments.$post({ json: data });
  return await res.json();
};

/**
 * Obtiene el detalle de un pago específico por UUID
 */
export const getPaymentById = async (id: string) => {
  const res = await api.payments[":id"].$get({ param: { id } });
  return await res.json();
};

/**
 * Actualiza la información de un pago
 */
export const updatePayment = async (id: string, data: UpdatePaymentReq) => {
  const res = await api.payments[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

/**
 * Elimina un pago (solo si no está CONFIRMADO)
 */
export const deletePayment = async (id: string) => {
  const res = await api.payments[":id"].$delete({ param: { id } });
  return await res.json();
};