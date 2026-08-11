import type { PrismaClient, RoleAccess } from "../../../generated/prisma/client";

const ROLE_NAMES: RoleAccess[] = ["ADMIN", "SALES_REP", "MARKETING", "SALES_SUPERVISOR", "COLLECTIONS"];

export async function seedRoles(prisma: PrismaClient) {
  const roles = await Promise.all(
    ROLE_NAMES.map((name) => prisma.role.upsert({ where: { name }, update: {}, create: { name } })),
  );
  console.log(`  ✓ ${roles.length} roles`);
  return Object.fromEntries(roles.map((r) => [r.name, r.id])) as Record<RoleAccess, string>;
}