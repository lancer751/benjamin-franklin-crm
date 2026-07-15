import crypto from "crypto";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const META_AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID!;
const META_APP_SECRET = process.env.META_APP_SECRET!;

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
}

interface LeadForm {
  id: string;
  name: string;
  status: string;
}

export interface FieldData {
  name: string;
  values: string[];
}

export interface LeadgenData {
  id: string;
  form_id: string;
  created_time: string;
  field_data: FieldData[];
}

interface GraphResponse<T> {
  data: T;
}

interface AdsResponse {
  data?: {
    adcreatives?: {
      data?: {
        object_story_spec?: {
          page_id?: string;
        };
      }[];
    };
  }[];
}

class ExternalError extends Error {
  code = "EXTERNAL";

  constructor(message: string) {
    super(message);
  }
}

async function graphGet<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new ExternalError(`Graph API request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export const metaService = {
  async listCampaigns(): Promise<Campaign[]> {
    const url =
      `${GRAPH_API_BASE}/${META_AD_ACCOUNT_ID}/campaigns` +
      `?fields=id,name,status,objective` +
      `&access_token=${META_ACCESS_TOKEN}`;

    const body = await graphGet<GraphResponse<Campaign[]>>(url);

    return body.data;
  },

  async listLeadForms(metaCampaignId: string): Promise<LeadForm[]> {
    const adsUrl =
      `${GRAPH_API_BASE}/${metaCampaignId}/ads` +
      `?fields=adcreatives{object_story_spec}` +
      `&access_token=${META_ACCESS_TOKEN}`;

    const ads = await graphGet<AdsResponse>(adsUrl);

    const pageId =
      ads.data?.[0]?.adcreatives?.data?.[0]?.object_story_spec?.page_id;

    if (!pageId) {
      return [];
    }

    const formsUrl =
      `${GRAPH_API_BASE}/${pageId}/leadgen_forms` +
      `?fields=id,name,status` +
      `&access_token=${META_ACCESS_TOKEN}`;

    const body = await graphGet<GraphResponse<LeadForm[]>>(formsUrl);

    return body.data;
  },

  async getLeadgenData(leadgenId: string): Promise<LeadgenData> {
    const url =
      `${GRAPH_API_BASE}/${leadgenId}` +
      `?access_token=${META_ACCESS_TOKEN}`;

    return graphGet<LeadgenData>(url);
  },

  async listFormLeadsSince(
    formId: string,
    since: Date
  ): Promise<LeadgenData[]> {
    const timestamp = Math.floor(since.getTime() / 1000);

    const filtering = encodeURIComponent(
      JSON.stringify([
        {
          field: "time_created",
          operator: "GREATER_THAN",
          value: timestamp,
        },
      ])
    );

    const url =
      `${GRAPH_API_BASE}/${formId}/leads` +
      `?fields=id,form_id,created_time,field_data` +
      `&filtering=${filtering}` +
      `&access_token=${META_ACCESS_TOKEN}`;

    const body = await graphGet<GraphResponse<LeadgenData[]>>(url);

    return body.data;
  },

  verifyWebhookSignature(
    rawBody: string,
    signatureHeader?: string
  ): boolean {
    if (!signatureHeader) {
      return false;
    }

    const expected =
      "sha256=" +
      crypto
        .createHmac("sha256", META_APP_SECRET)
        .update(rawBody)
        .digest("hex");

    return (
      expected.length === signatureHeader.length &&
      crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signatureHeader)
      )
    );
  },

  parseFieldData(fieldData: FieldData[]) {
    const get = (key: string): string | undefined =>
      fieldData.find((f) => f.name.toLowerCase() === key)?.values[0];

    const fullName = get("full_name");

    return {
      first_name: get("first_name") ?? fullName?.split(" ")[0],
      last_name:
        get("last_name") ?? fullName?.split(" ").slice(1).join(" "),
      email: get("email"),
      phone: get("phone_number")?.replace(/\D/g, "").slice(-9),
    };
  },
};