import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";
import { UUID_PATH } from "@/core/lib/constants";

type FAQsRes = InferResponseType<typeof api.products.faqs.$get>;
type FAQByIdRes = InferResponseType<(typeof api.products.faqs)[typeof UUID_PATH]["$get"]>;
type CreateFAQReq = InferRequestType<typeof api.products.faqs.$post>["json"];
type UpdateFAQReq = InferRequestType<(typeof api.products.faqs)[typeof UUID_PATH]["$put"]>["json"];
type DeleteFAQRes = InferResponseType<(typeof api.products.faqs)[typeof UUID_PATH]["$delete"]>;

export const getFAQs = async (): Promise<FAQsRes> => {
  const res = await api.products.faqs.$get();
  return await res.json();
};

export const getFAQById = async (id: string): Promise<FAQByIdRes> => {
  const res = await api.products.faqs[":id"].$get({ param: { id } });
  return await res.json();
};

export const createFAQ = async (data: CreateFAQReq) => {
  const res = await api.products.faqs.$post({ json: data });
  return await res.json();
};

export const updateFAQ = async (id: string, data: UpdateFAQReq) => {
  const res = await api.products.faqs[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

export const deleteFAQ = async (id: string): Promise<DeleteFAQRes> => {
  const res = await api.products.faqs[":id"].$delete({ param: { id } });
  return await res.json();
};
