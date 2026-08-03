export interface AdvisorFilterOption {
  userId: string;
  sellerProfileId: string;
  name: string;
}

export type CampaignSellerOption = AdvisorFilterOption;

export interface CampaignAssignmentOption {
  id: string;
  name: string;
  platform: string;
  sellers: CampaignSellerOption[];
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const stringValue = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeName = (...parts: unknown[]): string => {
  const name = parts
    .map((part) => stringValue(part).replace(/\s+/g, " "))
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "Asesor sin nombre";
};

const recordArray = (response: unknown, key?: string): UnknownRecord[] => {
  if (Array.isArray(response)) return response.filter(isRecord);
  if (!isRecord(response)) return [];
  const data = isRecord(response.data) ? response.data : response;
  const candidate = key ? data[key] : response.data;
  return Array.isArray(candidate) ? candidate.filter(isRecord) : [];
};

const sellerDirectory = (response: unknown): Map<string, CampaignSellerOption> =>
  new Map(
    recordArray(response).flatMap((seller) => {
      const user = isRecord(seller.user) ? seller.user : {};
      const sellerProfileId = stringValue(seller.id);
      const userId = stringValue(seller.user_id) || stringValue(user.id);
      if (!sellerProfileId || !userId || user.is_active === false) return [];
      return [[
        sellerProfileId,
        {
          userId,
          sellerProfileId,
          name: normalizeName(user.first_name, user.last_name),
        },
      ] as const];
    }),
  );

const adaptCampaign = (
  value: UnknownRecord,
  sellersByProfileId: Map<string, CampaignSellerOption>,
): CampaignAssignmentOption | null => {
  const id = stringValue(value.id);
  if (!id || stringValue(value.status) !== "ACTIVE") return null;

  const assignments = Array.isArray(value.sellersOnCampaign)
    ? value.sellersOnCampaign.filter(isRecord)
    : [];
  const sellers = assignments.flatMap((assignment) => {
    const nestedSeller = isRecord(assignment.seller) ? assignment.seller : {};
    const nestedUser = isRecord(nestedSeller.user) ? nestedSeller.user : {};
    const sellerProfileId = stringValue(assignment.seller_id) || stringValue(nestedSeller.id);
    if (!sellerProfileId) return [];

    const directorySeller = sellersByProfileId.get(sellerProfileId);
    const userId = directorySeller?.userId
      || stringValue(nestedSeller.user_id)
      || stringValue(nestedUser.id);
    if (!userId) return [];

    return [{
      userId,
      sellerProfileId,
      name: directorySeller?.name
        || normalizeName(nestedUser.first_name, nestedUser.last_name),
    }];
  });

  return {
    id,
    name: stringValue(value.name) || stringValue(value.campaing_name) || "Campaña sin nombre",
    platform: stringValue(value.platform),
    sellers: Array.from(
      new Map(sellers.map((seller) => [seller.userId, seller])).values(),
    ),
  };
};

export const adaptCampaignAssignments = (
  campaignsResponse: unknown,
  sellersResponse: unknown,
): CampaignAssignmentOption[] => {
  const sellersByProfileId = sellerDirectory(sellersResponse);
  return recordArray(campaignsResponse, "campaings")
    .map((campaign) => adaptCampaign(campaign, sellersByProfileId))
    .filter((campaign): campaign is CampaignAssignmentOption => campaign !== null);
};

export const adaptAdvisorFilterOptions = (
  campaignsResponse: unknown,
  sellersResponse: unknown,
): AdvisorFilterOption[] => {
  const advisors = adaptCampaignAssignments(campaignsResponse, sellersResponse)
    .flatMap((campaign) => campaign.sellers);

  return Array.from(
    new Map(advisors.map((advisor) => [advisor.userId, advisor])).values(),
  ).sort((first, second) => first.name.localeCompare(second.name, "es"));
};

export const adaptSellerCampaignAssignments = (
  response: unknown,
  userId: string,
  sellerProfileId: string,
): CampaignAssignmentOption[] => {
  if (!isRecord(response) || !userId || !sellerProfileId) return [];
  const data = isRecord(response.data) ? response.data : response;
  const assignments = Array.isArray(data.assignedCampaing)
    ? data.assignedCampaing.filter(isRecord)
    : [];

  return assignments.flatMap((assignment) => {
    const campaign = isRecord(assignment.campaign)
      ? assignment.campaign
      : isRecord(assignment.campaing)
        ? assignment.campaing
        : assignment;
    const id = stringValue(campaign.id);
    if (!id || stringValue(campaign.status) !== "ACTIVE") return [];
    return [{
      id,
      name: stringValue(campaign.name) || "Campaña sin nombre",
      platform: stringValue(campaign.platform),
      sellers: [{ userId, sellerProfileId, name: "Mi perfil" }],
    }];
  });
};
