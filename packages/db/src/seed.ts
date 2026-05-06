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
} from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("❌ DATABASE_URL no definida");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando SEED PROFESIONAL Y FILTRADO...");

  // 1. ROLES
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: RoleAccess.ADMIN }, update: {}, create: { name: RoleAccess.ADMIN } }),
    prisma.role.upsert({ where: { name: RoleAccess.SALES_REP }, update: {}, create: { name: RoleAccess.SALES_REP } }),
    prisma.role.upsert({ where: { name: RoleAccess.MARKETING }, update: {}, create: { name: RoleAccess.MARKETING } }),
    prisma.role.upsert({ where: { name: RoleAccess.SALES_SUPERVISOR }, update: {}, create: { name: RoleAccess.SALES_SUPERVISOR } }),
  ]);

  // IDs de roles para comparaciones rápidas
  const roleIds = {
    ADMIN: roles.find(r => r.name === RoleAccess.ADMIN)!.id,
    SALES_REP: roles.find(r => r.name === RoleAccess.SALES_REP)!.id,
    MARKETING: roles.find(r => r.name === RoleAccess.MARKETING)!.id,
    SALES_SUPERVISOR: roles.find(r => r.name === RoleAccess.SALES_SUPERVISOR)!.id,
  };

  // 2. USUARIOS (40)
  console.log("⏳ Generando 40 usuarios...");
  const createdUsers = [];
  for (const role of roles) {
    const batch = await Promise.all(
      Array.from({ length: 10 }).map(() =>
        prisma.user.create({
          data: {
            first_name: fakerES.person.firstName(),
            middle_name: fakerES.person.middleName(),
            last_name: fakerES.person.lastName(),
            password: "password123",
            email: fakerES.internet.email().toLowerCase(),
            role_id: role.id,
          }
        })
      )
    );
    createdUsers.push(...batch);
  }

  // 3. PERFILES DE SUPERVISOR (Solo para los que tienen el rol de SUPERVISOR)
  console.log("⏳ Creando perfiles para los Supervisores reales...");
  const supervisorUsers = createdUsers.filter(u => u.role_id === roleIds.SALES_SUPERVISOR);
  
  const createdSupervisors = await Promise.all(
    supervisorUsers.map(user => 
      prisma.salesSupervisorProfile.create({
        data: {
          user_id: user.id,
          team_name: `Equipo ${fakerES.commerce.department()}`,
          max_sellers: 10
        }
      })
    )
  );

  // Usaremos el primer supervisor creado para asignar a los vendedores en este seed
  const mainSupervisorId = createdSupervisors[0].id;

  // 4. PERFILES DE VENDEDOR (Solo para los que tienen el rol SALES_REP)
  console.log("⏳ Creando perfiles para los Vendedores reales...");
  const salesRepUsers = createdUsers.filter(u => u.role_id === roleIds.SALES_REP);

  await Promise.all(
    salesRepUsers.map((user) =>
      prisma.sellerProfile.create({
        data: {
          user_id: user.id,
          assigned_supervisor_id: mainSupervisorId,
          sales_target: 5000,
          total_sales: 0,
          total_orders: 0,
          completed_orders: 0,
          canceled_orders: 0,
          return_rate: "0",
          response_time_avg: "0"
        }
      })
    )
  );

  // 5. CATEGORÍAS, CURSOS Y RESTO DEL SEED (Igual que el tuyo pero optimizado)
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: "Ingeniería" }, update: {}, create: { name: "Ingeniería" } }),
    prisma.category.upsert({ where: { name: "Arquitectura" }, update: {}, create: { name: "Arquitectura" } }),
    prisma.category.upsert({ where: { name: "Gestión" }, update: {}, create: { name: "Gestión" } }),
  ]);

  console.log("⏳ Generando cursos y ediciones...");
  const courses = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.course.create({
        data: {
          name: fakerES.commerce.productName(),
          code: fakerES.string.alpha(5).toUpperCase(),
          image_url: fakerES.image.url(),
          classes_number: fakerES.number.int({ min: 10, max: 30 }),
          type: fakerES.helpers.arrayElement([CourseType.COURSE, CourseType.PROGRAM]),
        },
      })
    )
  );

  const allProducts = [];
  for (const course of courses) {
    const edition = await prisma.edition.create({
      data: {
        course_id: course.id,
        edition_number: 1,
        start_date: fakerES.date.soon({ days: 30 }),
        end_date: fakerES.date.future(),
        modality: fakerES.helpers.arrayElement([Modality.PRESENCIAL, Modality.VIRTUAL, Modality.HIBRIDO]),
        teacher_fullname: fakerES.person.fullName(),
        edition_status: EditionStatus.OPEN,
        edition_code: `${course.code}012026`,
        duration_unit: DurationUnit.WEEKS,
        duration_value: 8,
        hours_amount: 40,
        classes_number: course.classes_number,
      }
    });

    const modesToCreate = edition.modality === "HIBRIDO" ? ["VIRTUAL", "PRESENCIAL"] : [edition.modality];

    const product = await prisma.product.create({
      data: {
        name: course.name,
        slug: fakerES.helpers.slugify(course.name).toLowerCase() + "-" + fakerES.string.nanoid(4),
        edition_id: edition.id,
        category_id: fakerES.helpers.arrayElement(categories).id,
        installments_max_number: 6,
        installments_min_number: 1,
        sales_status: "ON_SALE",
        prices: {
          create: modesToCreate.map(mode => ({
            attendance_mode: mode as any,
            cash_price: fakerES.number.int({ min: 300, max: 600 }).toString(),
            installment_price: fakerES.number.int({ min: 100, max: 200 }).toString(),
            enrollment_fee: "50.00"
          }))
        }
      }
    });
    allProducts.push(product);
  }

  // 6. CAMPAÑAS Y LEADS
  console.log("⏳ Generando campañas y leads...");
  const shuffledProducts = [...allProducts].sort(() => 0.5 - Math.random());
  const campaigns = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.campaing.create({
        data: {
          campaing_name: `Camp. ${fakerES.company.catchPhrase()} ${fakerES.string.nanoid(3)}`,
          initial_budget: 1500.00,
          status: "ACTIVE",
          product_id: shuffledProducts[i].id,
          start_date: new Date(),
          platform: fakerES.helpers.arrayElement(["FACEBOOK", "TIKTOK", "WEBSITE"]),
          is_organic: false,
        }
      })
    )
  );

  for (let i = 0; i < 100; i++) {
    await prisma.lead.create({
      data: {
        first_name: fakerES.person.firstName(),
        last_name: fakerES.person.lastName(),
        middle_name: fakerES.person.middleName(),
        email: fakerES.internet.email().toLowerCase(),
        dni: fakerES.string.numeric(8),
        lead_status: "ACTIVE",
        primary_campaign_id: fakerES.helpers.arrayElement(campaigns).id,
      }
    });
  }

  console.log("🚀 SEED COMPLETADO CON ÉXITO Y DATOS LIMPIOS.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});