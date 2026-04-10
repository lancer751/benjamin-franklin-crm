import prisma from "@/lib/prisma";
import { fakerES } from "@faker-js/faker";
import type {
  CampaingPlatform,
  EditionStatus,
  LeadOriginSource,
} from "../generated/prisma/enums";
import { length } from "zod";

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

  //creating admin users
  await Promise.all(
    Array.from({ length: 10 }).map(() => {
      return prisma.user.create({
        data: {
          first_name: fakerES.person.firstName(),
          middle_name: fakerES.person.middleName(),
          last_name: fakerES.person.lastName(),
          password: "admin123",
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
          password: "seller123",
          email: fakerES.internet.email(),
          role_id: roles[1].id,
        },
      });
    }),
  );

  // creating marketers
  await Promise.all(
    Array.from({ length: 10 }).map(() => {
      return prisma.user.create({
        data: {
          first_name: fakerES.person.firstName(),
          middle_name: fakerES.person.middleName(),
          last_name: fakerES.person.lastName(),
          password: "password123",
          email: fakerES.internet.email(),
          role_id: roles[2].id,
        },
      });
    }),
  );

  // Courses and Editions
  const courses = await Promise.all(
    Array.from({ length: 30 }).map(() => {
      return prisma.course.create({
        data: {
          name: fakerES.commerce.productName(),
          code: fakerES.string.alpha(7).toUpperCase(),
          image_url: fakerES.image.url(),
        },
      });
    }),
  );

  const modalities = await Promise.all([
    prisma.modality.upsert({
      where: {
        name: "virtual",
      },
      update: {},
      create: {
        name: "virtual",
      },
    }),
    prisma.modality.upsert({
      where: {
        name: "presencial",
      },
      update: {},
      create: { name: "presencial" },
    }),
    prisma.modality.upsert({
      where: {
        name: "empaquetado",
      },
      update: {},
      create: { name: "empaquetado" },
    }),
  ]);

  const editionStatus = [
    "IN_PROGRESS",
    "COMPLETED",
    "OPEN",
    "SCHEDULED",
    "DRAFT",
    "CANCELLED",
  ];

  const editions = await Promise.all(
    courses.map((c) => {
      return prisma.edition.create({
        data: {
          course_id: c.id,
          edition_number: fakerES.number.int({ min: 1, max: 10 }),
          start_date: fakerES.date.between({
            from: "2020-01-01T00:00:00.000Z",
            to: "2026-04-01T00:00:00.000Z",
          }),
          end_date: fakerES.date.between({
            from: "2020-01-01T00:00:00.000Z",
            to: "2026-04-01T00:00:00.000Z",
          }),
          modality_id: fakerES.helpers.arrayElement(modalities).id,
          teacher_fullname: fakerES.person.fullName(),
          edition_status: fakerES.helpers.arrayElement(
            editionStatus,
          ) as EditionStatus,
          edition_code: `${c.code.concat(fakerES.string.alpha({length: 5, casing: "upper"}))}`,
          meet_link: fakerES.image.url(),
        },
      });
    }),
  );

  // Campaings, leads and campaing members
  const platforms = ["FACEBOOK", "WEBSITE", "TIKTOK", "INSTAGRAM"];
  const campaings = await Promise.all(
    editions.map((edition) => {
      return prisma.campaing.create({
        data: {
          campaing_name: `${fakerES.commerce.productAdjective()} ${fakerES.commerce.product()} Lanzamiento`,
          initial_budget: fakerES.number.float({
            min: 1000,
            max: 50000,
          }),
          status: "ACTIVE",
          start_date: fakerES.date.between({
            from: "2020-01-01T00:00:00.000Z",
            to: new Date(),
          }),
          platform: fakerES.helpers.arrayElement(platforms) as CampaingPlatform,
          is_organic: fakerES.datatype.boolean(),
          edition_id: edition.id,
        },
      });
    }),
  );

  const leads = await Promise.all(
    Array.from({
      length: 100,
    }).map(() => {
      return prisma.lead.create({
        data: {
          first_name: fakerES.person.firstName(),
          middle_name: fakerES.person.middleName(),
          last_name: fakerES.person.lastName(),
          email: fakerES.internet.email(),
          address: fakerES.location.streetAddress(),
          second_address: fakerES.location.streetAddress(),
          dni: fakerES.string.numeric({ length: 8 }),
        },
      });
    }),
  );

  const leadsId = leads.map((lead) => lead.id);
  const campaingsId = campaings.map((camp) => camp.id);
  const leadOriginSource = [
    "FACEBOOK",
    "INSTAGRAM",
    "TIKTOK",
    "WHATSAPP",
    "WEBSITE",
  ];

  const campaingMembersData = campaingsId.flatMap((id) => {
    const shuffledLeads = fakerES.helpers.shuffle(leadsId);

    return shuffledLeads.slice(0, 30).map((leadId) => ({
      lead_id: leadId,
      campaing_id: id,
      source: fakerES.helpers.arrayElement(
        leadOriginSource,
      ) as LeadOriginSource,
    }));
  });

  await prisma.campaingMember.createMany({
    data: campaingMembersData,
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
