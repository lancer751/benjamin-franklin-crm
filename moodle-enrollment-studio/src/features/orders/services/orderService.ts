import { api } from "@/core/lib/api";
import { searchLeads } from "@/features/leads/services/leadService";
import { getProducts } from "@/features/products/services/productService";
import type {
  ApiSuccess,
  CreateOrderPayload,
  GetOrdersParams,
  OrderLeadSummary,
  OrderListResponse,
  OrderProduct,
  OrderResponse,
  UpdateOrderPayload,
} from "../types";
import { adaptOrderListResponse, adaptSingleOrderResponse } from "./orderAdapter";

interface ApiErrorBody {
  error?: string | { message?: string; name?: string };
  message?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const optionalText = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const adaptSearchLead = (value: unknown): OrderLeadSummary | null => {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  const phones = Array.isArray(value.phones)
    ? value.phones.flatMap((phone) => {
        if (!isRecord(phone) || typeof phone.number !== "string") return [];
        return [{
          number: phone.number,
          ...(typeof phone.type === "string" && { type: phone.type }),
          isPrincipal: phone.isPrincipal === true || phone.is_principal === true,
        }];
      })
    : [];
  return {
    id: value.id,
    first_name: optionalText(value.first_name),
    middle_name: optionalText(value.middle_name),
    last_name: optionalText(value.last_name),
    email: optionalText(value.email),
    dni: optionalText(value.dni),
    lead_status: value.lead_status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    phones,
  };
};

const apiErrorMessage = (body: unknown): string => {
  if (!body || typeof body !== "object") return "Error inesperado del servidor";
  const errorBody = body as ApiErrorBody;
  if (typeof errorBody.error === "string") return errorBody.error;
  if (errorBody.error && typeof errorBody.error.message === "string") return errorBody.error.message;
  return errorBody.message || "Error inesperado del servidor";
};

export class OrderApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly serverMessage: string,
  ) {
    super(serverMessage);
    this.name = "OrderApiError";
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as unknown;
  if (!response.ok) {
    throw new OrderApiError(
      response.status,
      apiErrorMessage(body),
    );
  }
  return body as T;
}

export function mapOrderApiError(error: unknown): string {
  if (!(error instanceof OrderApiError)) {
    return "No se pudo guardar la orden. Revisa los datos e inténtalo nuevamente.";
  }
  const message = error.serverMessage;
  if (error.status === 403) {
    return "No tienes permisos para realizar esta acción sobre la orden.";
  }
  if (message.includes("Miembro de campaña no encontrado")) {
    return "La matrícula seleccionada ya no existe en esta campaña.";
  }
  if (message.includes("Order not found")) {
    return "La orden no existe.";
  }
  if (message.includes("No price found for product")) {
    return "No existe un precio configurado para el producto y modalidad seleccionados.";
  }
  if (message.includes("Modo de asistencia no válido") || message.includes("No hay un precio configurado")) {
    return "La modalidad seleccionada no está disponible para este producto.";
  }
  if (message.includes("solo permite pagos al contado")) {
    return "El producto seleccionado solo permite pagos al contado.";
  }
  if (message.includes("código") || message.includes("Código")) {
    return message;
  }
  if (message.includes("cronograma de pagos")) {
    return "No se pueden modificar los productos porque la orden ya tiene un cronograma de pagos.";
  }
  if (message.includes("confirmed payments") || message.includes("pagos confirmados")) {
    return "No se puede anular la orden porque tiene pagos confirmados.";
  }
  if (message.includes("Target user not found") || message.includes("Usuario asignado")) {
    return "El usuario asignado no existe o está inactivo.";
  }
  if (message.includes("Discount must be between 0 and the order subtotal")) {
    return "El descuento debe estar entre S/ 0.00 y el subtotal de la orden.";
  }
  if (message.includes("Cannot complete order with unpaid balance")) {
    return "No se puede completar la orden porque mantiene un saldo pendiente. Registra o confirma los pagos correspondientes.";
  }
  if (
    message.includes("Estado de tipificación inválido para generar una orden")
  ) {
    return "El prospecto ya no se encuentra en la etapa “Matriculado” para esta campaña. Actualiza la información e inténtalo nuevamente.";
  }
  return "No se pudo guardar la orden. Revisa los datos e inténtalo nuevamente.";
}

export const getOrders = async ({
  page = 1,
  limit = 20,
  order_status,
  member_id,
  generated_by,
  creation_order = "desc",
}: GetOrdersParams = {}): Promise<OrderListResponse> => {
  const normalizedOrderStatus = order_status;
  const normalizedMemberId = member_id?.trim();
  const normalizedGeneratedBy = generated_by?.trim();
  const response = await api.orders.$get({
    query: {
      page: String(page),
      limit: String(limit),
      creation_order,
      ...(normalizedOrderStatus ? { order_status: normalizedOrderStatus } : {}),
      ...(normalizedMemberId ? { member_id: normalizedMemberId } : {}),
      ...(normalizedGeneratedBy ? { generated_by: normalizedGeneratedBy } : {}),
    },
  });
  return adaptOrderListResponse(await readResponse<unknown>(response));
};

export const getOrderById = async (
  id: string,
): Promise<ApiSuccess<OrderResponse>> => {
  const response = await api.orders[":id"].$get({ param: { id } });
  return adaptSingleOrderResponse(await readResponse<unknown>(response));
};

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<ApiSuccess<OrderResponse>> => {
  const response = await api.orders.$post({ json: payload });
  return adaptSingleOrderResponse(await readResponse<unknown>(response));
};

export const updateOrder = async (
  id: string,
  payload: UpdateOrderPayload,
): Promise<ApiSuccess<OrderResponse>> => {
  const response = await api.orders[":id"].$put({
    param: { id },
    json: payload,
  });
  return adaptSingleOrderResponse(await readResponse<unknown>(response));
};

export const deleteOrder = async (
  id: string,
): Promise<{ success: true; message: string }> => {
  const response = await api.orders[":id"].$delete({ param: { id } });
  return readResponse<{ success: true; message: string }>(response);
};

export interface SearchOrderLeadsParams {
  search: string;
  assignedTo?: string;
}

export async function searchOrderLeads(
  { search, assignedTo }: SearchOrderLeadsParams,
  signal?: AbortSignal,
): Promise<OrderLeadSummary[]> {
  const normalizedAssignedTo = assignedTo?.trim();
  const result: unknown = await searchLeads({
    page: "1",
    limit: "10",
    search,
    ...(normalizedAssignedTo ? { assigned_to: normalizedAssignedTo } : {}),
  }, signal);
  const data = isRecord(result) && isRecord(result.data) ? result.data : null;
  if (!data || !Array.isArray(data.leads)) {
    throw new Error("No se pudieron buscar prospectos.");
  }
  return data.leads
    .map(adaptSearchLead)
    .filter((lead): lead is OrderLeadSummary => lead !== null);
}

export async function getOrderProducts(): Promise<OrderProduct[]> {
  const result = (await getProducts()) as unknown;
  if (!Array.isArray(result)) {
    throw new Error("No se pudieron cargar los productos.");
  }
  return (result as OrderProduct[]).filter(
    (product) =>
      ["PUBLISHED", "ON_SALE"].includes(product.sales_status) &&
      product.pricing_status !== "INVALID" &&
      product.prices.length > 0,
  );
}
