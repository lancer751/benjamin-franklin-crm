import { describe, expect, it } from "vitest";
import { getMetaSyncAvailability } from "./metaSyncAvailability";

const validCampaign = {
  status: "ACTIVE",
  is_organic: false,
  platform: "FACEBOOK",
  meta_campaign_id: "meta-campaign-1",
  meta_form_id: "meta-form-1",
  sellersOnCampaign: [{ seller_id: "seller-1" }],
};

describe("getMetaSyncAvailability", () => {
  it("allows a valid paid Meta campaign with an assigned seller", () => {
    expect(getMetaSyncAvailability(validCampaign)).toEqual({
      allowed: true,
      missingRequirements: [],
    });
  });

  it("explains specifically when the Meta form is missing", () => {
    expect(
      getMetaSyncAvailability({ ...validCampaign, meta_form_id: null }),
    ).toEqual({
      allowed: false,
      missingRequirements: [
        "Selecciona un formulario instantáneo de Meta antes de sincronizar.",
      ],
    });
  });

  it("collects every unmet requirement", () => {
    const result = getMetaSyncAvailability({
      ...validCampaign,
      status: "PAUSED",
      is_organic: true,
      platform: "WEBSITE",
      meta_campaign_id: null,
      meta_form_id: null,
      sellersOnCampaign: [],
    });

    expect(result.allowed).toBe(false);
    expect(result.missingRequirements).toHaveLength(5);
  });

  it("accepts Instagram as a Meta platform", () => {
    expect(
      getMetaSyncAvailability({ ...validCampaign, platform: "INSTAGRAM" })
        .allowed,
    ).toBe(true);
  });
});
