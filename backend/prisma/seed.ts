import prisma from "@/lib/prisma";
import { fakerES } from "@faker-js/faker";

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

  const admins = await Promise.all(
    Array.from({ length: 10 }).map(() => {
      return prisma.user.create({
        data: {
          first_name: fakerES.person.firstName(),
          middle_name: fakerES.person.middleName(),
          last_name: fakerES.person.lastName(),
          password: "password123",
          email: fakerES.internet.email(),
          role_id: roles[0].id,
        },
      });
    }),
  );

  const sellers = await Promise.all(
    Array.from({ length: 10 }).map(() => {
      return prisma.user.create({
        data: {
          first_name: fakerES.person.firstName(),
          middle_name: fakerES.person.middleName(),
          last_name: fakerES.person.lastName(),
          password: "password123",
          email: fakerES.internet.email(),
          role_id: roles[1].id,
        },
      });
    }),
  );

  // TODO: create fake data for the other entities
  
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
