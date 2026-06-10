// workflows/crm/orchestrator.ts
import { fakeSellers, fakeSupervisors } from "./fake-data/fake-users";
import { fakeCampaigns } from "./fake-data/fake-campaigns";
import { fakeLeads } from "./fake-data/fake-leads";
import type { fakeProducts } from "../product-launch/fake-data/products";
import { fakeCampaignSellers } from "./fake-data/fake-campaigns-sellers";

export async function CrmWorkflow(
  products: Awaited<ReturnType<typeof fakeProducts>>,
) {
  console.log("  👔  Seeding supervisors...");
  const supervisors = await fakeSupervisors();

  console.log("  🧑‍💼  Seeding sellers...");
  const sellers = await fakeSellers(supervisors);

  console.log("  📣  Seeding campaigns...");
  const campaigns = await fakeCampaigns(supervisors, products);

  console.log("  🔗  Assigning sellers to campaigns...");
  await fakeCampaignSellers(campaigns, sellers);

  console.log("  👤  Seeding leads + members + interactions + tasks...");
  const members = await fakeLeads(campaigns, sellers);

  const wonCount = members.filter((m) => m.member.status === "WON").length;
  const lostCount = members.filter((m) => m.member.status === "LOST").length;
  const activeCount = members.length - wonCount - lostCount;

  console.log(`  ✅  CRM done. Created:`);
  console.log(`      - ${supervisors.length} supervisors`);
  console.log(`      - ${sellers.length} sellers`);
  console.log(`      - ${campaigns.length} campaigns`);
  console.log(
    `      - ${members.length} leads (${activeCount} active · ${wonCount} won · ${lostCount} lost)`,
  );

  return { supervisors, sellers, campaigns, members };
}