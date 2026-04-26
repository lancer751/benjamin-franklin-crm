import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// Constante para las rutas dinámicas de User (con el regex del backend)
const UUID_PATH = ":id{[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}}" as const;

// ==========================================
// TIPOS INFERIDOS
// ==========================================

// Usuarios
type UsersRes = InferResponseType<typeof api.users.$get>;
type UserByIdRes = InferResponseType<(typeof api.users)[typeof UUID_PATH]["$get"]>;
type CreateUserReq = InferRequestType<typeof api.users.$post>["json"];
type UpdateUserReq = InferRequestType<(typeof api.users)[typeof UUID_PATH]["$put"]>["json"];
type DeleteUserRes = InferResponseType<(typeof api.users)[typeof UUID_PATH]["$delete"]>;

// Sellers (Vendedores) - Aquí Hono simplificó a ":id" por la anidación
type SellersRes = InferResponseType<typeof api.users.sellers.$get>;
type SellerProfileByIdRes = InferResponseType<typeof api.users.sellers[":id"]["$get"]>;
type CreateSellerProfileReq = InferRequestType<typeof api.users.sellers.$post>["json"];
type UpdateSellerProfileReq = InferRequestType<typeof api.users.sellers[":id"]["$put"]>["json"];

// Marketers & Roles
type MarketersRes = InferResponseType<typeof api.users.marketers.$get>;
type RolesRes = InferResponseType<typeof api.users.roles.$get>;

// ==========================================
// SERVICIOS: USUARIOS (Basado en userRoutes)
// ==========================================

export const getUsers = async (): Promise<UsersRes> => {
  const res = await api.users.$get();
  return await res.json();
};

export const getUserById = async (id: string): Promise<UserByIdRes> => {
  const res = await api.users[UUID_PATH].$get({ param: { id } });
  return await res.json();
};

export const createUser = async (data: CreateUserReq) => {
  const res = await api.users.$post({ json: data });
  return await res.json();
};

export const updateUser = async (id: string, data: UpdateUserReq) => {
  const res = await api.users[UUID_PATH].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

export const deleteUser = async (id: string): Promise<DeleteUserRes> => {
  const res = await api.users[UUID_PATH].$delete({ param: { id } });
  return await res.json();
};

// ==========================================
// SERVICIOS: VENDEDORES (SELLERS)
// ==========================================

export const getSellers = async (): Promise<SellersRes> => {
  const res = await api.users.sellers.$get();
  return await res.json();
};

export const getSellerProfileById = async (id: string): Promise<SellerProfileByIdRes> => {
  const res = await api.users.sellers[":id"].$get({ param: { id } });
  return await res.json();
};

export const createSellerProfile = async (data: CreateSellerProfileReq) => {
  const res = await api.users.sellers.$post({ json: data });
  return await res.json();
};

export const updateSellerProfile = async (id: string, data: UpdateSellerProfileReq) => {
  const res = await api.users.sellers[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

// ==========================================
// SERVICIOS: MARKETING Y ROLES
// ==========================================

export const getMarketers = async (): Promise<MarketersRes> => {
  const res = await api.users.marketers.$get();
  return await res.json();
};

export const getRoles = async (): Promise<RolesRes> => {
  const res = await api.users.roles.$get();
  return await res.json();
};