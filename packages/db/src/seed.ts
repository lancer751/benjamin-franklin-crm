import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { CoursesWorkflow } from "./workflows/product-launch/orchestator";
import { hash } from "bcrypt";
import { fakerES } from "@faker-js/faker";

const databaseUrl = `${process.env.DATABASE_URL}`;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding...");
  const roles = await Promise.all([
    prisma.role.upsert({
      where: {
        name: "ADMIN",
      },
      update: {},
      create: {
        name: "ADMIN",
      },
    }),
    prisma.role.upsert({
      where: {
        name: "SALES_REP",
      },
      update: {},
      create: {
        name: "SALES_REP",
      },
    }),
    prisma.role.upsert({
      where: {
        name: "MARKETING",
      },
      update: {},
      create: {
        name: "MARKETING",
      },
    }),
    prisma.role.upsert({
      where: {
        name: "SALES_SUPERVISOR",
      },
      update: {},
      create: {
        name: "SALES_SUPERVISOR",
      },
    }),
  ]);

  const adminRoleId = await prisma.role.findUnique({where: {name: "ADMIN"}, select: {id: true}})

  const users = await prisma.user.create({
    data: {
      first_name: fakerES.person.firstName(),
      middle_name: fakerES.person.middleName(),
      last_name: fakerES.person.lastName(),
      email: fakerES.internet.email(),
      corporate_email: fakerES.internet.exampleEmail(),
      role_id: adminRoleId ? adminRoleId.id : roles[0].id,
      is_active: true,
      password: await hash("password123#", 10),
    },
  });

  await CoursesWorkflow();
  console.log("🎉 Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
