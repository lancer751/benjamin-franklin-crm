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
  console.log("🌱 Seeding Roles...");
  await Promise.all([
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
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN" },
    }),
    prisma.role.upsert({
      where: { name: "COLLECTIONS" },
      update: {},
      create: { name: "COLLECTIONS" },
    }),
  ]);

  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" }, 
    select: { id: true }
  });

  if (!adminRole) {
    throw new Error("No se pudo encontrar el rol ADMIN para el seed.");
  }

  console.log("👤 Seeding Admin User...");
  const adminEmail = "admin@cebf.edu.pe"; 
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      first_name: fakerES.person.firstName(),
      middle_name: fakerES.person.middleName(),
      last_name: fakerES.person.lastName(),
      email: adminEmail,
      corporate_email: "admin.corporativo@cebf.edu.pe",
      role_id: adminRole.id, 
      is_active: true,
      password: await hash("password123#", 10),
    },
  });

  // =========================================================
  // 🚀 SEEDING DE CATEGORÍAS SOLICITADAS
  // =========================================================
  console.log("🏷️ Seeding Categories...");
  const categoriesToSeed = [
    "Construcción",
    "Textil y Confecciones",
    "Tecnologia"
  ];

  await Promise.all(
    categoriesToSeed.map((categoryName) =>
      prisma.category.upsert({
        where: { name: categoryName },
        update: {}, 
        create: {
          name: categoryName,
        },
      })
    )
  );

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
