import { api } from "@/core/lib/api";

export interface MetaCampaignOption {
  id: string;
  name: string;
  status: string;
  objective?: string;
}

export interface MetaFormOption {
  id: string;
  name: string;
  status: string;
}

export const getMetaCampaigns = async (): Promise<MetaCampaignOption[]> => {
  const response = await api.meta.campaigns.$get();
  const body: any = await response.json();

  if (!response.ok || !body?.success) {
    throw new Error(body.message || "No se pudieron cargar las campañas de Meta");
  }

  return Array.isArray(body.data) ? body.data : [];
};

export const getMetaForms = async (metaCampaignId: string): Promise<MetaFormOption[]> => {
  const response = await api.meta.campaigns[":metaCampaignId"].forms.$get({
    param: { metaCampaignId },
  });
  const body: any = await response.json();

  if (!response.ok || !body?.success) {
    throw new Error(body.message || "No se pudieron cargar los formularios de Meta");
  }

  return Array.isArray(body.data) ? body.data : [];
};
