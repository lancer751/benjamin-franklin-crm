import { fakerES } from "@faker-js/faker";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  RoleAccess,
  CourseType,
  EditionStatus,
  Modality,
  DurationUnit,
} from "../generated/prisma/client"; // Asegúrate de apuntar a /client

// 1. Configuramos la conexión manual que el cliente generado exige
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ La variable DATABASE_URL no está definida en el .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Pasamos el adaptador como argumento al constructor
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando SEED MASIVO (Carga de 30 cursos y 40 usuarios)...");

  // 1. ROLES (Upsert para no duplicar)
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: RoleAccess.ADMIN }, update: {}, create: { name: RoleAccess.ADMIN } }),
    prisma.role.upsert({ where: { name: RoleAccess.SALES_REP }, update: {}, create: { name: RoleAccess.SALES_REP } }),
    prisma.role.upsert({ where: { name: RoleAccess.MARKETING }, update: {}, create: { name: RoleAccess.MARKETING } }),
    prisma.role.upsert({ where: { name: RoleAccess.SALES_SUPERVISOR }, update: {}, create: { name: RoleAccess.SALES_SUPERVISOR } }),
  ]);

  // 2. USUARIOS MASIVOS (10 por rol = 40 usuarios)
  console.log("⏳ Generando 40 usuarios aleatorios...");
  for (const role of roles) {
    await Promise.all(
      Array.from({ length: 10 }).map(() => 
        prisma.user.create({
          data: {
            first_name: fakerES.person.firstName(),
            middle_name: fakerES.person.middleName(),
            last_name: fakerES.person.lastName(),
            password: "password123",
            email: fakerES.internet.email(),
            role_id: role.id,
          }
        })
      )
    );
  }

  // 3. CATEGORÍAS
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: "Ingeniería" }, update: {}, create: { name: "Ingeniería" } }),
    prisma.category.upsert({ where: { name: "Arquitectura" }, update: {}, create: { name: "Arquitectura" } }),
    prisma.category.upsert({ where: { name: "Gestión" }, update: {}, create: { name: "Gestión" } }),
  ]);

  // 4. CURSOS MASIVOS (30 cursos)
  console.log("⏳ Generando 30 cursos con sus beneficios...");
  const courses = await Promise.all(
    Array.from({ length: 30 }).map(() =>
      prisma.course.create({
        data: {
          name: fakerES.commerce.productName(),
          code: fakerES.string.alpha(7).toUpperCase(),
          image_url: fakerES.image.url(),
          classes_number: fakerES.number.int({ min: 8, max: 32 }),
          category_id: fakerES.helpers.arrayElement(categories).id,
          type: fakerES.helpers.arrayElement([CourseType.COURSE, CourseType.PROGRAM]),
        },
      })
    )
  );

  // 5. EDICIONES MASIVAS (30 ediciones, una por curso)
  console.log("⏳ Generando 30 ediciones activas...");
  await Promise.all(
    courses.map((c) => {
      const edNum = fakerES.number.int({ min: 1, max: 5 });
      return prisma.edition.create({
        data: {
          course_id: c.id,
          edition_number: edNum,
          start_date: fakerES.date.soon({ days: 30 }),
          end_date: fakerES.date.future(),
          modality: fakerES.helpers.arrayElement([
            Modality.PRESENCIAL,
            Modality.VIRTUAL,
            Modality.HIBRIDO,
          ]),
          teacher_fullname: fakerES.person.fullName(),
          edition_status: EditionStatus.OPEN,
          edition_code: `${c.code}${edNum.toString().padStart(2, "0")}2026`,
          meet_link: fakerES.internet.url(),
          classes_number: c.classes_number,
          duration_unit: DurationUnit.WEEKS,
          duration_value: fakerES.number.int({ min: 4, max: 12 }),
          hours_amount: fakerES.number.int({ min: 40, max: 100 }),
        },
      });
    })
  );

  console.log("✅ SEED MASIVO COMPLETADO. 30 Cursos y 40 Usuarios listos.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });