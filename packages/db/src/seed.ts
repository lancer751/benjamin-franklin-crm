// src/seed.ts  — updated to include CRM workflow
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { CoursesWorkflow } from "./workflows/product-launch/orchestator";
import { compare, hash } from "bcrypt";
import { CrmWorkflow } from "./workflows/leads-management/orchestator";

const databaseUrl = `${process.env.DATABASE_URL}`;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding...\n");

  // ── Roles ──────────────────────────────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN" },
    }),
    prisma.role.upsert({
      where: { name: "SALES_REP" },
      update: {},
      create: { name: "SALES_REP" },
    }),
    prisma.role.upsert({
      where: { name: "MARKETING" },
      update: {},
      create: { name: "MARKETING" },
    }),
    prisma.role.upsert({
      where: { name: "SALES_SUPERVISOR" },
      update: {},
      create: { name: "SALES_SUPERVISOR" },
    }),
  ]);

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "ADMIN" },
    select: { id: true },
  });

  const hashed = await hash("password123#", 10);

  await prisma.user.upsert({
    where: { email: "admin@bf.edu.pe" },
    update: {},
    create: {
      first_name: "Admin",
      middle_name: "",
      last_name: "BF",
      email: "admin@bf.edu.pe",
      corporate_email: "admin@bf.edu.pe",
      role_id: adminRole.id,
      is_active: true,
      password: hashed,
    },
  });

  // // ── Academic workflow (courses → editions → products) ──────────────────────
  console.log("📚 Running CoursesWorkflow...");
  const { products } = await CoursesWorkflow();

  console.log("\n📋 Running CrmWorkflow...");
  await CrmWorkflow(products);

  console.log("\n🎉 Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
