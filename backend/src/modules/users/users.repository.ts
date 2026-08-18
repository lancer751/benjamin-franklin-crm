import type { PrismaClient, UserCreateInput } from "@repo/database";

export const createUserRepository = (prisma: PrismaClient) => {
  return {
    findByEmail: (email: string) =>
      prisma.user.findUnique({ where: { email } }),
    create: (data: UserCreateInput) => prisma.user.create({ data }),
  };
};

export type UserRepository = ReturnType<typeof createUserRepository>;
