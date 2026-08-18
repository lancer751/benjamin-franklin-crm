import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CreateUserSchema } from "shared";
import { createUserService } from "./users.service";
import { createUserRepository } from "./users.repository";
import withPrisma from "@/lib/prisma";
import type { ContextWithPrisma } from "@/lib/contextVariables";

export const userRoutes = new Hono<ContextWithPrisma>()
.use(withPrisma)
.post(
  "/",
  zValidator("json", CreateUserSchema),
  async (c) => {
    const service = createUserService(createUserRepository(c.get("prisma")));
    const user = await service.registerUser(c.req.valid("json"));
    return c.json({ success: true, data: user }, 201);
  },
);
