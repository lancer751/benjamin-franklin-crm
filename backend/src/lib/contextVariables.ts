import type { PrismaClient } from "@repo/database"

export type ContextWithPrisma = {
  Variables: {
    prisma: PrismaClient
  }
}