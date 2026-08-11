import { faker } from "@faker-js/faker";
import type { PrismaClient } from "../../../generated/prisma/client";

export async function seedLeads(prisma: PrismaClient, count = 5) {
  faker.seed(42); // reproducible entre corridas
  const leadIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    const lead = await prisma.lead.upsert({
      where: { email },
      update: {},
      create: {
        first_name: firstName, last_name: lastName, email,
        gender: faker.helpers.arrayElement(["MALE", "FEMALE", "NOT_SPECIFIED"]),
        lead_status: "ACTIVE",
        phones: { create: { number: `9${faker.string.numeric(8)}`, type: "WHATSAPP", isPrincipal: true } },
      },
    });
    leadIds.push(lead.id);
  }

  console.log(`  ✓ ${leadIds.length} leads`);
  return leadIds;
}