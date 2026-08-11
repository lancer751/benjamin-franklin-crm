import type { PrismaClient, RoleAccess } from "../../../generated/prisma/client";
import { hashPassword } from "../utils/password";
import type { SeedUsers } from "../context";

const DEFAULT_PASSWORD = "password123#";

export async function seedUsers(prisma: PrismaClient, roles: Record<RoleAccess, string>): Promise<SeedUsers> {
  const password = await hashPassword(DEFAULT_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bf.edu.pe" },
    update: {},
    create: { first_name: "Admin", middle_name: "", last_name: "BF", email: "admin@bf.edu.pe", role_id: roles.ADMIN, password },
  });

  const supervisorUser = await prisma.user.upsert({
    where: { email: "supervisor@bf.edu.pe" },
    update: {},
    create: { first_name: "Lucía", middle_name: "", last_name: "Ramos", email: "supervisor@bf.edu.pe", role_id: roles.SALES_SUPERVISOR, password },
  });
  const supervisorProfile = await prisma.salesSupervisorProfile.upsert({
    where: { user_id: supervisorUser.id }, update: {}, create: { user_id: supervisorUser.id },
  });

  const sellerSeeds = [
    { email: "seller1@bf.edu.pe", first_name: "Carlos", last_name: "Quispe" },
    { email: "seller2@bf.edu.pe", first_name: "Sofía", last_name: "Torres" },
  ];
  const sellers: SeedUsers["sellers"] = [];
  for (const s of sellerSeeds) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, middle_name: "", role_id: roles.SALES_REP, password },
    });
    const profile = await prisma.sellerProfile.upsert({
      where: { user_id: user.id },
      update: {},
      create: { user_id: user.id, assigned_supervisor_id: supervisorProfile.id, sales_target: 20 },
    });
    sellers.push({ userId: user.id, sellerProfileId: profile.id });
  }

  const marketingUser = await prisma.user.upsert({
    where: { email: "marketing@bf.edu.pe" },
    update: {},
    create: { first_name: "Ana", middle_name: "", last_name: "Flores", email: "marketing@bf.edu.pe", role_id: roles.MARKETING, password },
  });
  await prisma.marketingProfile.upsert({ where: { user_id: marketingUser.id }, update: {}, create: { user_id: marketingUser.id } });

  console.log(`  ✓ 1 admin, 1 supervisor, ${sellers.length} sellers, 1 marketer`);
  return { adminId: admin.id, supervisorUserId: supervisorUser.id, supervisorProfileId: supervisorProfile.id, sellers, marketingUserId: marketingUser.id };
}