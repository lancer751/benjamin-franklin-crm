import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { HTTPException } from "hono/http-exception";
import { compare } from "bcrypt";
import type { SuccessResponse } from "@/app";
import { clearAuthCookies, setAuthCookies } from "@/utils/cookie";
import { verifyUserAccessAuth } from "@/middlewares/auth.middleware";

export const authRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/me", verifyUserAccessAuth, async (c) => {
    const authenticatedUser = c.var.authUser;

    const user = await c.get("prisma").user.findUnique({
      where: { id: authenticatedUser.userId },
      include: { role: true },
      omit: { role_id: true, password: true },
    });

    return c.json(user, 200);
  })
  .post(
    "/login",
    zValidator(
      "json",
      z.object({
        email: z.email().min(1, "Email is required"),
        password: z.string().min(6, "Password is required"),
      }),
    ),
    async (c) => {
      const { email, password } = c.req.valid("json");
      const user = await c.get("prisma").user.findUnique({
        where: { email },
        include: {
          role: { select: { name: true } },
        },
      });

      if (!user) {
        throw new HTTPException(401, { message: "Invalid email or password" });
      }

      const checkPassword = await compare(password, user?.password);

      if (!checkPassword) {
        throw new HTTPException(401, { message: "Invalid email or password" });
      }

      await setAuthCookies(c, user.id, user.role.name);

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Login successful",
        },
        200,
      );
    },
  )
  .post("/logout", verifyUserAccessAuth, async (c) => {
    clearAuthCookies(c);
    return c.json({ success: true, message: "Logged out successfully" }, 200);
  });
