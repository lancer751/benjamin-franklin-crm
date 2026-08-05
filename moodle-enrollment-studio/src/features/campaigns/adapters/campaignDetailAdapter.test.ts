import { describe, expect, it } from "vitest";
import {
  adaptCampaignDetail,
  getCampaignAttendanceModeLabel,
} from "./campaignDetailAdapter";

describe("campaignDetailAdapter", () => {
  it("normaliza el contador directo de prospectos sin convertir cero en ausencia", () => {
    const detail = adaptCampaignDetail({
      sellersOnCampaign: [
        {
          id: "campaign-seller-1",
          seller_id: "seller-profile-1",
          assigned_at: "2026-08-05T10:00:00.000Z",
          assigned_leads_count: 0,
          seller: {
            id: "seller-profile-1",
            total_orders: 4,
            user: {
              id: "user-1",
              first_name: "Ada",
              last_name: "Lovelace",
              is_active: true,
            },
          },
        },
        {
          id: "campaign-seller-2",
          seller_id: "seller-profile-2",
          seller: { id: "seller-profile-2", user: { id: "user-2" } },
        },
      ],
    });

    expect(detail.advisors).toEqual([
      expect.objectContaining({
        campaignSellerId: "campaign-seller-1",
        sellerProfileId: "seller-profile-1",
        userId: "user-1",
        fullName: "Ada Lovelace",
        assignedLeadsCount: 0,
        totalOrders: 4,
        isActive: true,
      }),
      expect.objectContaining({
        assignedLeadsCount: null,
        totalOrders: 0,
        isActive: null,
      }),
    ]);
  });

  it("resuelve HEREDADO con la modalidad de la edicion y conserva ambos precios", () => {
    const detail = adaptCampaignDetail({
      relatedProduct: {
        enrollment_fee: "250",
        edition: { modality: "HIBRIDO" },
        prices: [
          { attendance_mode: "HEREDADO", cash_price: "1000", installment_price: "1200" },
          { attendance_mode: "ASINCRONICO", cash_price: 900, installment_price: null },
        ],
      },
    });

    expect(detail.productPricing).toEqual({
      enrollmentFee: "250",
      prices: [
        { modalityLabel: "Híbrido", cashPrice: "1000", installmentPrice: "1200" },
        { modalityLabel: "Asincrónico", cashPrice: 900, installmentPrice: null },
      ],
    });
    expect(getCampaignAttendanceModeLabel("HEREDADO", null)).toBe("No especificado");
  });
});
