import { api } from "@/core/lib/api";
import { searchLeads } from "@/features/leads/services/leadService";
import { getProducts } from "@/features/products/services/productService";
import type {
  ApiSuccess,
  CreateOrderPayload,
  OrderLeadSummary,
  OrderProduct,
  OrderResponse,
  UpdateOrderPayload,
} from "../types";

interface ApiErrorBody {
  error?: string;
  message?: string;
}

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
    const errorBody = body as ApiErrorBody;
    throw new OrderApiError(
      response.status,
      errorBody.error || errorBody.message || "Error inesperado del servidor",
    );
  }
  return body as T;
}

export function mapOrderApiError(error: unknown): string {
  if (!(error instanceof OrderApiError)) {
    return "No se pudo guardar la orden. Revisa los datos e inténtalo nuevamente.";
  }
  const message = error.serverMessage;
  if (message.includes("Lead not found")) {
    return "El prospecto seleccionado no existe o fue eliminado.";
  }
  if (message.includes("Order not found")) {
    return "La orden no existe.";
  }
  if (message.includes("No price found for product")) {
    return "No existe un precio configurado para el producto y modalidad seleccionados.";
  }
  if (message.includes("Discount must be between 0 and the order subtotal")) {
    return "El descuento debe estar entre S/ 0.00 y el subtotal de la orden.";
  }
  if (message.includes("Cannot complete order with unpaid balance")) {
    return "No se puede completar la orden porque mantiene un saldo pendiente. Registra o confirma los pagos correspondientes.";
  }
  return "No se pudo guardar la orden. Revisa los datos e inténtalo nuevamente.";
}

export const getOrders = async (): Promise<ApiSuccess<OrderResponse[]>> => {
  const response = await api.orders.$get();
  return readResponse<ApiSuccess<OrderResponse[]>>(response);
};

export const getOrderById = async (
  id: string,
): Promise<ApiSuccess<OrderResponse>> => {
  const response = await api.orders[":id"].$get({ param: { id } });
  return readResponse<ApiSuccess<OrderResponse>>(response);
};

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<ApiSuccess<OrderResponse>> => {
  const response = await api.orders.$post({ json: payload });
  return readResponse<ApiSuccess<OrderResponse>>(response);
};

export const updateOrder = async (
  id: string,
  payload: UpdateOrderPayload,
): Promise<ApiSuccess<OrderResponse>> => {
  const response = await api.orders[":id"].$put({
    param: { id },
    json: payload,
  });
  return readResponse<ApiSuccess<OrderResponse>>(response);
};

export const deleteOrder = async (
  id: string,
): Promise<{ success: true; message: string }> => {
  const response = await api.orders[":id"].$delete({ param: { id } });
  return readResponse<{ success: true; message: string }>(response);
};

export async function searchOrderLeads(
  search: string,
  signal?: AbortSignal,
): Promise<OrderLeadSummary[]> {
  const result = (await searchLeads({
    page: "1",
    limit: "10",
    search,
  }, signal)) as unknown as ApiSuccess<{ leads: OrderLeadSummary[] }>;
  if (!result.success || !Array.isArray(result.data?.leads)) {
    throw new Error("No se pudieron buscar prospectos.");
  }
  return result.data.leads;
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
