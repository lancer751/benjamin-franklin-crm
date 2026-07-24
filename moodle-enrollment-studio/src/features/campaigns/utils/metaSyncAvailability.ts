export interface MetaSyncCampaign {
  status?: string | null;
  is_organic?: boolean | null;
  platform?: string | null;
  meta_campaign_id?: string | null;
  meta_form_id?: string | null;
  sellersOnCampaign?: unknown[] | null;
}

export interface MetaSyncAvailability {
  allowed: boolean;
  missingRequirements: string[];
}

export const getMetaSyncAvailability = (
  campaign: MetaSyncCampaign,
): MetaSyncAvailability => {
  const missingRequirements: string[] = [];
  const isMetaPlatform =
    campaign.platform === "FACEBOOK" ||
    campaign.platform === "INSTAGRAM";

  if (campaign.status !== "ACTIVE") {
    missingRequirements.push("Activa la campaña para sincronizar leads.");
  }

  if (campaign.is_organic || !isMetaPlatform) {
    missingRequirements.push(
      "La sincronización solo está disponible para campañas pagadas de Facebook o Instagram.",
    );
  }

  if (!campaign.meta_campaign_id) {
    missingRequirements.push(
      "Esta campaña no está vinculada a una campaña de Meta.",
    );
  }

  if (!campaign.meta_form_id) {
    missingRequirements.push(
      "Selecciona un formulario instantáneo de Meta antes de sincronizar.",
    );
  }

  if (!campaign.sellersOnCampaign?.length) {
    missingRequirements.push("Asigna al menos un asesor de ventas.");
  }

  return {
    allowed: missingRequirements.length === 0,
    missingRequirements,
  };
};
