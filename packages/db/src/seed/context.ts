// Nota deliberada: separamos userId de sellerProfileId en todo el contexto.
// CampaignSeller.seller_id apunta a SellerProfile.id, mientras que
// CampaignMember.assigned_to y Order.generated_by/assigned_to apuntan a
// User.id — mezclarlos fue justo el bug de FK que arreglamos hace unas
// iteraciones, así que el contexto lo hace explícito para no repetirlo.

export type SeedUsers = {
  adminId: string;
  supervisorUserId: string;
  supervisorProfileId: string;
  sellers: { userId: string; sellerProfileId: string }[];
  marketingUserId: string;
};

export type SeedAcademic = { hibridoEditionId: string; asincronicoEditionId: string };

export type SeedProducts = {
  hibridoProductId: string;
  asincronicoProductId: string;
  discountCode: string;
};

export type SeedCampaign = { campaignId: string };

export type SeedMember = { id: string; assignedTo: string; status: string };

export type SeedOrder = { id: string; detailId: string; modality: "HIBRIDO" | "ASINCRONICO" };