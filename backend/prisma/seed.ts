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

  const users = await Promise.all([
    Array.from({
      length: 20
    }).map(() => {
      prisma.user.create({
        data: {
          first_name: fakerES.person.firstName(),
          middle_name: fakerES.person.middleName(),
          last_name: fakerES.person.lastName(),
          password: "password123",
          email: fakerES.internet.email(),
          role_id: roles[Math.floor((Math.random() * roles.length))]!.id
        }
      })
    })
  ])

  const sellerUser = await prisma.user.create({
    data: {
      first_name: "Juan",
      middle_name: "",
      last_name: "Perez",
      email: "seller@test.com",
      password: "hashed_password",
      role_id: salesRole!.id,
      seller: {
        create: {
          sales_target: 10000,
          max_discount: 20,
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
