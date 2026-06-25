import { UUID_PATH } from "@/core/lib/constants";
import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// ==========================================
// TIPOS INFERIDOS: USUARIOS
// ==========================================
type UsersRes = InferResponseType<typeof api.users.$get>;
type UserByIdRes = InferResponseType<(typeof api.users)[typeof UUID_PATH]["$get"]>;
type CreateUserReq = InferRequestType<typeof api.users.$post>["json"];
type UpdateUserReq = InferRequestType<(typeof api.users)[typeof UUID_PATH]["$put"]>["json"];
type RolesRes = InferResponseType<typeof api.users.roles.$get>;

// ==========================================
// TIPOS INFERIDOS: PERFILES
// ==========================================

// Supervisores
type SupervisorsRes = InferResponseType<(typeof api.users)["sales-supervisors"]["$get"]>;
type SupervisorDetailRes = InferResponseType<
  (typeof api.users)["sales-supervisors"][typeof UUID_PATH]["$get"]
>;

// Tipo para la actualización del perfil del supervisor
type UpdateSupervisorProfileReq = InferRequestType<
  (typeof api.users)["sales-supervisors"][typeof UUID_PATH]["$put"]
>["json"];


// Sellers
type SellersRes = InferResponseType<typeof api.users.sellers.$get>;
type SellerProfileByIdRes = InferResponseType<(typeof api.users.sellers.sellers)[":id"]["$get"]>; 
type UpdateSellerProfileReq = InferRequestType<(typeof api.users.sellers.sellers)[":id"]["$put"]>["json"];
type SellerCampaignsRes = InferResponseType<(typeof api.users.sellers)["sellers"][":id"]["campaigns"]["$get"]>;

// ==========================================
// SERVICIOS: USUARIOS GENERALES
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

export const deleteUser = async (id: string) => {
  const res = await api.users[UUID_PATH].$delete({ param: { id } });
  return await res.json();
};

export const getRoles = async (): Promise<RolesRes> => {
  const res = await api.users.roles.$get();
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
  const res = await api.users.sellers.sellers[":id"].$get({ param: { id } });
  return await res.json();
};

export const getSellerCampaigns = async (id: string): Promise<SellerCampaignsRes> => {
  const res = await (api.users.sellers as any)["sellers"][":id"]["campaigns"].$get({ param: { id } });
  return await res.json();
};

export const updateSellerProfile = async (id: string, data: UpdateSellerProfileReq) => {
  const res = await api.users.sellers.sellers[":id"].$put({ 
    param: { id }, 
    json: data 
  });
  return await res.json();
};

// ==========================================
// SERVICIOS: SUPERVISORES
// ==========================================

export const getSupervisors = async (): Promise<SupervisorsRes> => {
  const res = await api.users["sales-supervisors"].$get();
  return await res.json();
};

export const getSupervisorById = async (id: string): Promise<SupervisorDetailRes> => {
  const res = await api.users["sales-supervisors"][UUID_PATH].$get({
    param: { id },
  });
  return await res.json();
};

export const updateSupervisorProfile = async (
  id: string, 
  data: UpdateSupervisorProfileReq
) => {
  const res = await api.users["sales-supervisors"][UUID_PATH].$put({
    param: { id },
    json: data,
  });
  return await res.json();
};