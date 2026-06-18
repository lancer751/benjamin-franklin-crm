import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateBenefitSchema, UpdateBenefitSchema } from "shared";
import { z } from "zod";

export const benefitRoutes = new Hono<ContextWithPrisma>()
  .use(verifyUserRoleAccess("ADMIN"))
  .get("/", async (c) => {
    const benefits = await c.get("prisma").benefit.findMany({
      orderBy: { description: "asc" },
    });

    return c.json<SuccessResponse<typeof benefits>>(
      {
        success: true,
        data: benefits,
        message: "Benefits retrieved successfully",
      },
      200,
    );
  })
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const benefit = await c.get("prisma").benefit.findUnique({
        where: { id },
        include: { coursesRelated: true },
      });

      if (!benefit) {
        throw new HTTPException(404, { message: "Benefit not found" });
      }

      return c.json<SuccessResponse<typeof benefit>>(
        {
          success: true,
          data: benefit,
          message: "Benefit retrieved successfully",
        },
        200,
      );
    },
  )
  .post(
    "/",
    zValidator("json", CreateBenefitSchema),
    async (c) => {
      const data = c.req.valid("json");

      const newBenefit = await c.get("prisma").benefit.create({ data });

      return c.json<SuccessResponse<typeof newBenefit>>(
        {
          success: true,
          data: newBenefit,
          message: "Benefit created successfully",
        },
        201,
      );
    },
  )
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", UpdateBenefitSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const data = c.req.valid("json");

      const existing = await c
        .get("prisma")
        .benefit.findUnique({ where: { id } });
      if (!existing) {
        throw new HTTPException(404, { message: "Benefit not found" });
      }

      const updated = await c
        .get("prisma")
        .benefit.update({ where: { id }, data });

      return c.json<SuccessResponse<typeof updated>>(
        {
          success: true,
          data: updated,
          message: "Benefit updated successfully",
        },
        200,
      );
    },
  )
  .delete(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const existing = await c
        .get("prisma")
        .benefit.findUnique({ where: { id } });
      if (!existing) {
        throw new HTTPException(404, { message: "Benefit not found" });
      }

      await c.get("prisma").benefit.delete({ where: { id } });

      return c.json<SuccessResponse>(
        { success: true, message: "Benefit deleted successfully" },
        200,
      );
    },
  );
