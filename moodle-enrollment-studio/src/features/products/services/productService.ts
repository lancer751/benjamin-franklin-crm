import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";
import {UUID_PATH} from '@/core/lib/constants'

// ==========================================
// TIPOS INFERIDOS DESDE EL BACKEND
// ==========================================

type ProductsRes = InferResponseType<typeof api.products.$get>;
type ProductByIdRes = InferResponseType<(typeof api.products)[typeof UUID_PATH]["$get"]>;
type CreateProductReq = InferRequestType<typeof api.products.$post>["json"];
type UpdateProductReq = InferRequestType<(typeof api.products)[typeof UUID_PATH]["$put"]>["json"];
type DeleteProductRes = InferResponseType<(typeof api.products)[typeof UUID_PATH]["$delete"]>;

export const getProducts = async (): Promise<ProductsRes> => {
  const res = await api.products.$get();
  return await res.json();
};

export const getProductById = async (id: string): Promise<ProductByIdRes> => {
  const [baseRes, commRes] = await Promise.all([
    api.products[":id"].$get({ param: { id } }).then((r) => r.json()),
    getProductCommercialContent(id).catch(() => null),
  ]);

  if (!baseRes.success) {
    return baseRes;
  }

  if (commRes && commRes.success && commRes.data) {
    const mergedData = {
      ...baseRes.data,
      brochure_url: commRes.data.brochure_url ?? baseRes.data.brochure_url,
      description: commRes.data.description ?? baseRes.data.description,
      short_description: commRes.data.short_description ?? baseRes.data.short_description,
      slug: commRes.data.slug ?? baseRes.data.slug,
      relatedBenefits: (commRes.data.relatedBenefits ?? []).map((rb: any) => {
        const b = rb.benefits || rb.benefit || rb;
        return {
          id: b.id || rb.benefit_id || "",
          benefit_id: rb.benefit_id || b.id || "",
          description: b.description || "",
          name: b.name || "",
          icon_name: b.icon_name || "",
          benefits: b,
        };
      }),
      frequentQuestions: (commRes.data.frequentQuestions ?? []).map((fq: any) => {
        const f = fq.faq || fq;
        return {
          id: f.id || fq.faq_id || "",
          faq_id: fq.faq_id || f.id || "",
          question: f.question || "",
          answer: f.answer || "",
          faq: f,
        };
      }),
      relatedCertifications: (commRes.data.relatedCertifications ?? []).map((rc: any) => {
        const c = rc.certification || rc;
        return {
          id: c.id || rc.certification_id || "",
          certification_id: rc.certification_id || c.id || "",
          title: c.title || "",
          description: c.description || "",
          image_url: c.image_url || "",
          issuing_authority: c.issuing_authority || "",
          registry_validity: c.registry_validity || "",
          has_digital: c.has_digital,
          has_physical: c.has_physical,
          certification: c,
        };
      }),
    };

    return {
      ...baseRes,
      data: mergedData as any,
    };
  }

  return baseRes;
};

export const createProduct = async (data: CreateProductReq) => {
  const res = await api.products.$post({ json: data });
  return await res.json();
};

export const updateProduct = async (id: string, data: UpdateProductReq) => {
  const res = await api.products[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

export const deleteProduct = async (id: string): Promise<DeleteProductRes> => {
  const res = await api.products[":id"].$delete({ param: { id } });
  return await res.json();
};

// ==========================================
// NUEVO: TIPOS E INFERENCIA COMERCIAL
// ==========================================

export type ProductCommercialContentRes = InferResponseType<
  typeof api.cms.products[typeof UUID_PATH]["commercial-content"]["$get"]
>;


export const getProductCommercialContent = async (id: string): Promise<ProductCommercialContentRes> => {
  const res = await api.cms.products[":id"]["commercial-content"].$get({
    param: { id }
  });
  return await res.json();
};

type UpdateCommercialContentReq = InferRequestType<typeof api.cms.products[typeof UUID_PATH]["commercial-content"]["$put"]>["json"];

export const updateProductCommercialContent = async (id: string, data: UpdateCommercialContentReq) => {
  const res = await api.cms.products[":id"]["commercial-content"].$put({
    param: { id },
    json: data
  });
  return await res.json();
};