// workflows/crm/fake-data/fake-users.ts
import { prisma } from "../../..";
import { fakerES as faker } from "@faker-js/faker";
import { hash } from "bcrypt";

export async function fakeSupervisors() {
  const role = await prisma.role.findUniqueOrThrow({
    where: { name: "SALES_SUPERVISOR" },
    select: { id: true },
  });

  const supervisorDefs = [
    {
      first_name: "Carlos",
      last_name: "Mendoza",
      email: "cmendoza@bf.edu.pe",
      team_name: "Equipo Alpha",
    },
    {
      first_name: "Lucia",
      last_name: "Paredes",
      email: "lparedes@bf.edu.pe",
      team_name: "Equipo Beta",
    },
  ];

  return await Promise.all(
    supervisorDefs.map(async (def) => {
      const user = await prisma.user.upsert({
        where: { email: def.email },
        update: {},
        create: {
          first_name: def.first_name,
          middle_name: "",
          last_name: def.last_name,
          email: def.email,
          corporate_email: def.email,
          role_id: role.id,
          is_active: true,
          password: await hash("password123#", 10),
        },
      });

      const profile = await prisma.salesSupervisorProfile.upsert({
        where: { user_id: user.id },
        update: {},
        create: {
          user_id: user.id,
          team_name: def.team_name,
          max_sellers: 10,
          can_assign_leads: true,
          can_reassign_leads: true,
          can_approve_discounts: true,
          can_cancel_orders: true,
          can_view_all_team_sales: true,
        },
      });

      return { user, profile };
    }),
  );
}

export async function fakeSellers(
  supervisors: Awaited<ReturnType<typeof fakeSupervisors>>,
) {
  const role = await prisma.role.findUniqueOrThrow({
    where: { name: "SALES_REP" },
    select: { id: true },
  });

  // 3 sellers per supervisor
  const sellerDefs = [
    // Supervisor 0 team
    {
      first_name: "Miguel",
      last_name: "Torres",
      email: "mtorres@bf.edu.pe",
      supervisorIndex: 0,
    },
    {
      first_name: "Ana",
      last_name: "Quispe",
      email: "aquispe@bf.edu.pe",
      supervisorIndex: 0,
    },
    {
      first_name: "Roberto",
      last_name: "Flores",
      email: "rflores@bf.edu.pe",
      supervisorIndex: 0,
    },
    // Supervisor 1 team
    {
      first_name: "Valeria",
      last_name: "Castillo",
      email: "vcastillo@bf.edu.pe",
      supervisorIndex: 1,
    },
    {
      first_name: "Diego",
      last_name: "Huanca",
      email: "dhuanca@bf.edu.pe",
      supervisorIndex: 1,
    },
    {
      first_name: "Patricia",
      last_name: "Salinas",
      email: "psalinas@bf.edu.pe",
      supervisorIndex: 1,
    },
  ];

  return await Promise.all(
    sellerDefs.map(async (def) => {
      const supervisor = supervisors[def.supervisorIndex];

      if (!supervisor) {
        throw new Error(
          `Supervisor with index ${def.supervisorIndex} not found for seller ${def.email}`,
        );
      }
      const user = await prisma.user.upsert({
        where: { email: def.email },
        update: {},
        create: {
          first_name: def.first_name,
          middle_name: "",
          last_name: def.last_name,
          email: def.email,
          corporate_email: def.email,
          role_id: role.id,
          is_active: true,
          password: await hash("password123#", 10),
        },
      });

      const profile = await prisma.sellerProfile.upsert({
        where: { user_id: user.id },
        update: {},
        create: {
          user_id: user.id,
          assigned_supervisor_id: supervisor.profile.id,
          sales_target: faker.number.int({ min: 5, max: 20 }),
        },
      });

      return { user, profile, supervisorIndex: def.supervisorIndex };
    }),
  );
}
