import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// ==========================================
// TIPOS INFERIDOS DESDE EL BACKEND
// ==========================================

// Tipos Generales de Usuario
type UsersRes = InferResponseType<typeof api.users.$get>;
type UserByIdRes = InferResponseType<typeof api.users[":id"]["$get"]>;
type CreateUserReq = InferRequestType<typeof api.users.$post>["json"];
type UpdateUserReq = InferRequestType<typeof api.users[":id"]["$put"]>["json"];
type DeleteUserRes = InferResponseType<typeof api.users[":id"]["$delete"]>;

// Tipos de Perfiles Especializados (Sellers y Marketers)
type SellersRes = InferResponseType<typeof api.users.sellers.$get>;
type MarketersRes = InferResponseType<typeof api.users.marketers.$get>;
type SellerProfileByIdRes = InferResponseType<typeof api.users.sellers[":id"]["$get"]>;
type SellerProfileByUserIdRes = InferResponseType<typeof api.users.sellers[":user_id"]["$get"]>;
type CreateSellerProfileReq = InferRequestType<typeof api.users.sellers.$post>["json"];
type UpdateSellerProfileReq = InferRequestType<typeof api.users.sellers[":id"]["$put"]>["json"];

// Tipos de Roles
type RolesRes = InferResponseType<typeof api.users.roles.$get>;


// ==========================================
// SERVICIOS: USUARIOS GENERALES
// ==========================================

export const getUsers = async (): Promise<UsersRes> => {
  const res = await api.users.$get();
  return await res.json();
};

export const getUserById = async (id: string): Promise<UserByIdRes> => {
  const res = await api.users[":id"].$get({ param: { id } });
  return await res.json();
};

export const createUser = async (data: CreateUserReq) => {
  const res = await api.users.$post({ json: data });
  return await res.json();
};

export const updateUser = async (id: string, data: UpdateUserReq) => {
  const res = await api.users[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

export const deleteUser = async (id: string): Promise<DeleteUserRes> => {
  const res = await api.users[":id"].$delete({ param: { id } });
  return await res.json();
};


// ==========================================
// SERVICIOS: PERFILES DE VENDEDORES (SELLERS)
// ==========================================

export const getSellers = async (): Promise<SellersRes> => {
  const res = await api.users.sellers.$get();
  return await res.json();
};

export const getSellerProfileById = async (id: string): Promise<SellerProfileByIdRes> => {
  const res = await api.users.sellers[":id"].$get({ param: { id } });
  return await res.json();
};

export const getSellerProfileByUserId = async (user_id: string): Promise<SellerProfileByUserIdRes> => {
  const res = await api.users.sellers[":user_id"].$get({ param: { user_id } });
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
// SERVICIOS: PERFILES DE MARKETING
// ==========================================

export const getMarketers = async (): Promise<MarketersRes> => {
  const res = await api.users.marketers.$get();
  return await res.json();
};


// ==========================================
// SERVICIOS: ROLES
// ==========================================

export const getRoles = async (): Promise<RolesRes> => {
  const res = await api.users.roles.$get();
  return await res.json();
};