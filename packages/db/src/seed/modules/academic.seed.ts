import type { PrismaClient } from "../../../generated/prisma/client";
import type { SeedAcademic } from "../context";

export async function seedAcademic(
  prisma: PrismaClient,
): Promise<SeedAcademic> {
  const course = await prisma.course.upsert({
    where: { code: "FSWD001" },
    update: {},
    create: {
      type: "PROGRAM",
      name: "Desarrollo Full Stack",
      classes_number: 40,
      code: "FSWD001",
    },
  });

  const hibrido = await prisma.edition.upsert({
    where: { edition_code: "FSWD001-26-01" },
    update: {},
    create: {
      course_id: course.id,
      edition_number: 1,
      start_date: new Date("2026-09-01"),
      end_date: new Date("2026-12-15"),
      hours_amount: 120,
      classes_number: 40,
      duration_value: 4,
      duration_unit: "MONTHS",
      modality: "HIBRIDO",
      edition_status: "SCHEDULED",
      edition_code: "FSWD001-26-01",
    },
  });

  const asincronico = await prisma.edition.upsert({
    where: { edition_code: "FSWD001-26-02" },
    update: {},
    create: {
      course_id: course.id,
      edition_number: 2,
      start_date: new Date("2026-09-01"),
      end_date: new Date("2026-12-15"),
      hours_amount: 60,
      classes_number: 20,
      duration_value: 3,
      duration_unit: "MONTHS",
      modality: "ASINCRONICO",
      edition_status: "SCHEDULED",
      edition_code: "FSWD001-26-02",
    },
  });

  console.log(`  ✓ 1 curso, 2 ediciones (HIBRIDO + ASINCRONICO)`);
  return { hibridoEditionId: hibrido.id, asincronicoEditionId: asincronico.id };
}
