import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// ==========================================
// TIPOS INFERIDOS: AUTH
// ==========================================
type LoginReq = InferRequestType<typeof api.auth.login.$post>["json"];
type LoginRes = InferResponseType<typeof api.auth.login.$post>;
type MeRes = InferResponseType<typeof api.auth.me.$get>;

// ==========================================
// SERVICIOS: AUTH
// ==========================================

export const login = async (data: LoginReq): Promise<LoginRes> => {
  const res = await api.auth.login.$post({ json: data });
  return await res.json();
};

export const getMe = async (): Promise<MeRes | null> => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/auth/me`, {
      method: "GET",
      credentials: "include", // Vital para leer las cookies HttpOnly
    });
    if (!res.ok) return null; // Si da 401 o 403, simplemente no hay sesión, retorna null de forma pacífica
    return await res.json() as MeRes;
  } catch {
    return null;
  }
};

export const logout = async () => {
  const res = await api.auth.logout.$post();
  return await res.json();
};