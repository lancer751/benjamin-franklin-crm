import type { PrismaClient, RoleAccess } from "@repo/database";

export type ContextWithPrisma = {
  Variables: {
    prisma: PrismaClient,
    authUser: {
      userId: string;
      role: RoleAccess;
    };
  };
};

export type AuthContext = {
  Variables: {
    authUser: {
      userId: string;
      role: RoleAccess;
    };
  };
};