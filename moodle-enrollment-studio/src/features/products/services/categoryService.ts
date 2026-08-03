import { api } from "@/core/lib/api";
import type {
  CreateCategoryPayload,
  ProductCategory,
  UpdateCategoryPayload,
} from "../types/category.types";

interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

interface DeleteCategoryResponse {
  success: true;
  message: string;
}

type ErrorRecord = Record<string, unknown>;

export class CategoryApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly serverMessage: string,
  ) {
    super(serverMessage);
    this.name = "CategoryApiError";
  }
}

const isErrorRecord = (value: unknown): value is ErrorRecord =>
  typeof value === "object" && value !== null;

const getServerMessage = (body: unknown): string => {
  if (!isErrorRecord(body)) return "Error inesperado del servidor";
  if (typeof body.message === "string") return body.message;
  if (typeof body.error === "string") return body.error;
  if (isErrorRecord(body.error) && typeof body.error.message === "string") {
    return body.error.message;
  }
  return "Error inesperado del servidor";
};

const readResponse = async <T>(response: Response): Promise<T> => {
  const body = (await response.json()) as unknown;
  if (!response.ok) {
    throw new CategoryApiError(response.status, getServerMessage(body));
  }
  return body as T;
};

const unwrapData = <T>(response: ApiSuccess<T>): T => response.data;

export const getCategories = async (): Promise<ProductCategory[]> => {
  const response = await api.products.categories.$get();
  return unwrapData(await readResponse<ApiSuccess<ProductCategory[]>>(response));
};

export const getCategoryById = async (id: string): Promise<ProductCategory> => {
  const response = await api.products.categories[":id"].$get({ param: { id } });
  return unwrapData(await readResponse<ApiSuccess<ProductCategory>>(response));
};

export const createCategory = async (
  payload: CreateCategoryPayload,
): Promise<ProductCategory> => {
  const response = await api.products.categories.$post({ json: payload });
  return unwrapData(await readResponse<ApiSuccess<ProductCategory>>(response));
};

export const updateCategory = async (
  id: string,
  payload: UpdateCategoryPayload,
): Promise<ProductCategory> => {
  const response = await api.products.categories[":id"].$put({
    param: { id },
    json: payload,
  });
  return unwrapData(await readResponse<ApiSuccess<ProductCategory>>(response));
};

export const deleteCategory = async (id: string): Promise<void> => {
  const response = await api.products.categories[":id"].$delete({ param: { id } });
  await readResponse<DeleteCategoryResponse>(response);
};

export const getCategoryErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (!(error instanceof CategoryApiError)) return fallback;

  const normalizedMessage = error.serverMessage.toLowerCase();
  if (
    error.status === 409 &&
    (normalizedMessage.includes("associated product") ||
      normalizedMessage.includes("producto") ||
      normalizedMessage.includes("asociad"))
  ) {
    return "No se puede eliminar esta categoría porque existen productos asociados. Reasigna esos productos antes de eliminarla.";
  }
  if (error.status === 409 && normalizedMessage.includes("already exists")) {
    return "Ya existe una categoría con ese nombre.";
  }
  if (error.status === 400 && normalizedMessage.includes("at least 2")) {
    return "El nombre de la categoría debe tener al menos 2 caracteres.";
  }
  if (error.status === 403) {
    return "No tienes permisos para realizar esta acción.";
  }
  if (error.status === 404) {
    return "La categoría ya no existe.";
  }
  return fallback;
};
