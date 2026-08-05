import { ModalityMap, translateEnum } from "@/core/utils/dictionaries";

type ApiRecord = Record<string, unknown>;

export interface CampaignDetailAdvisor {
  campaignSellerId: string | null;
  sellerProfileId: string | null;
  userId: string | null;
  fullName: string;
  assignedAt: string | null;
  assignedLeadsCount: number | null;
  totalOrders: number;
  isActive: boolean | null;
}

export interface CampaignDetailPrice {
  modalityLabel: string;
  cashPrice: string | number | null;
  installmentPrice: string | number | null;
}

export interface CampaignDetailProductPricing {
  enrollmentFee: string | number | null;
  prices: CampaignDetailPrice[];
}

export interface CampaignDetailViewModel {
  advisors: CampaignDetailAdvisor[];
  productPricing: CampaignDetailProductPricing;
}

const isRecord = (value: unknown): value is ApiRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): ApiRecord => (isRecord(value) ? value : {});

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const asFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const asCurrencyValue = (value: unknown): string | number | null =>
  typeof value === "string" || typeof value === "number" ? value : null;

const getFullName = (user: ApiRecord): string => {
  const names = [asString(user.first_name), asString(user.last_name)].filter(
    (name): name is string => Boolean(name),
  );

  return names.join(" ") || "Asesor sin nombre";
};

export const getCampaignAttendanceModeLabel = (
  attendanceMode: unknown,
  editionModality: unknown,
): string => {
  const resolvedMode =
    attendanceMode === "HEREDADO" ? asString(editionModality) : asString(attendanceMode);

  return translateEnum(resolvedMode, ModalityMap);
};

const adaptAdvisor = (value: unknown): CampaignDetailAdvisor => {
  const campaignSeller = asRecord(value);
  const seller = asRecord(campaignSeller.seller);
  const user = asRecord(seller.user);

  return {
    campaignSellerId: asString(campaignSeller.id),
    sellerProfileId: asString(campaignSeller.seller_id) ?? asString(seller.id),
    userId: asString(user.id),
    fullName: getFullName(user),
    assignedAt: asString(campaignSeller.assigned_at),
    assignedLeadsCount: asFiniteNumber(campaignSeller.assigned_leads_count),
    totalOrders: asFiniteNumber(seller.total_orders) ?? 0,
    isActive: typeof user.is_active === "boolean" ? user.is_active : null,
  };
};

export const adaptCampaignDetail = (campaign: unknown): CampaignDetailViewModel => {
  const campaignRecord = asRecord(campaign);
  const relatedProduct = asRecord(campaignRecord.relatedProduct);
  const edition = asRecord(relatedProduct.edition);
  const rawPrices = Array.isArray(relatedProduct.prices) ? relatedProduct.prices : [];
  const rawAdvisors = Array.isArray(campaignRecord.sellersOnCampaign)
    ? campaignRecord.sellersOnCampaign
    : [];

  return {
    advisors: rawAdvisors.map(adaptAdvisor),
    productPricing: {
      enrollmentFee: asCurrencyValue(relatedProduct.enrollment_fee),
      prices: rawPrices.map((rawPrice) => {
        const price = asRecord(rawPrice);

        return {
          modalityLabel: getCampaignAttendanceModeLabel(
            price.attendance_mode,
            edition.modality,
          ),
          cashPrice: asCurrencyValue(price.cash_price),
          installmentPrice: asCurrencyValue(price.installment_price),
        };
      }),
    },
  };
};
