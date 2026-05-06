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

export const getMe = async (): Promise<MeRes> => {
  const res = await api.auth.me.$get();
  return await res.json();
};

export const logout = async () => {
  const res = await api.auth.logout.$post();
  return await res.json();
};