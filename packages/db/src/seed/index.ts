import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { seedRoles } from "./modules/roles.seed";
import { seedUsers } from "./modules/users.seed";
import { seedAcademic } from "./modules/academic.seed";
import { seedProducts } from "./modules/products.seed";
import { seedCampaigns } from "./modules/campaigns.seed";
import { seedLeads } from "./modules/leads.seed";
import { seedCampaignMembers } from "./modules/campaign-members.seed";
import { seedOrders } from "./modules/orders.seed";
import { seedPayments } from "./modules/payments.seed";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");
if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_SEED) {
  throw new Error(
    "Refusing to seed against production — set ALLOW_PROD_SEED=true if this is intentional",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  console.log("🌱 Seeding Benjamin CRM...\n");

  console.log("→ Roles");
  const roles = await seedRoles(prisma);

  console.log("→ Users & profiles");
  const users = await seedUsers(prisma, roles);

  console.log("→ Academic");
  const academic = await seedAcademic(prisma);

  console.log("→ Products & pricing");
  const products = await seedProducts(prisma, academic, users.adminId);

  console.log("→ Campaigns");
  const campaign = await seedCampaigns(
    prisma,
    products.hibridoProductId,
    users.supervisorProfileId,
    users.sellers.map((s) => s.sellerProfileId),
  );

  console.log("→ Leads");
  const leadIds = await seedLeads(prisma);

  console.log("→ Campaign members");
  const members = await seedCampaignMembers(
    prisma,
    campaign.campaignId,
    leadIds,
    users.sellers.map((s) => s.userId),
  );

  console.log("→ Orders");
  const orders = await seedOrders(prisma, members, users.adminId, products);

  console.log("→ Payments");
  await seedPayments(prisma, orders, users.adminId);

  console.log("\n✅ Seed completo");
  console.log(`   login admin: admin@bf.edu.pe / password123#`);
}

main()
  .catch((e) => {
    console.error("❌ Seed falló:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
