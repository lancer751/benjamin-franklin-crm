// workflows/crm/fake-data/fake-campaigns.ts
import { prisma } from "../../..";
import type { fakeProducts } from "../../product-launch/fake-data/products";
import type { fakeSupervisors } from "./fake-users";

export async function fakeCampaigns(
  supervisors: Awaited<ReturnType<typeof fakeSupervisors>>,
  products: Awaited<ReturnType<typeof fakeProducts>>,
) {
  // products[0] = LP Virtual (VIRTUAL modality, ON_SALE)
  // products[2] = Power BI (VIRTUAL modality, ON_SALE)
  // We only create campaigns for ON_SALE products
  const [lpProduct, pbProduct] = products;

  if (!lpProduct || !pbProduct) {
    throw new Error("Expected products not found in fakeProducts result");
  }

  const campaigns = await Promise.all([
    // Campaign 1 — Facebook campaign for Lectura de Planos, supervisor 0
    prisma.campaing.create({
      data: {
        campaing_name: "Lectura de Planos — Facebook Jun 2025",
        status: "ACTIVE",
        platform: "FACEBOOK",
        is_organic: false,
        start_date: new Date("2025-06-01"),
        end_date: new Date("2025-07-31"),
        initial_budget: 1500,
        meta_form_id: "meta_form_lp_001", // placeholder
        product_id: lpProduct.id,
        supervisor_id: supervisors[0]!.profile.id,
      },
    }),

    // Campaign 2 — Instagram organic campaign for Power BI, supervisor 1
    prisma.campaing.create({
      data: {
        campaing_name: "Power BI — Instagram Orgánico Jun 2025",
        status: "ACTIVE",
        platform: "INSTAGRAM",
        is_organic: true,
        start_date: new Date("2025-06-10"),
        end_date: null,
        initial_budget: 0,
        meta_form_id: null,
        product_id: pbProduct.id,
        supervisor_id: supervisors[1]!.profile.id,
      },
    }),
  ]);

  return campaigns;
}