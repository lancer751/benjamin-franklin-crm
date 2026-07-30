export type CampaignCurrencyValue = string | number | null | undefined;

const penCurrencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export const parseCampaignCurrency = (value: CampaignCurrencyValue) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCampaignCurrency = (value: CampaignCurrencyValue) =>
  penCurrencyFormatter.format(parseCampaignCurrency(value));
