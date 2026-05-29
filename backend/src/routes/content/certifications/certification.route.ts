import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  CreateRefinedCertificationSchema,
  UpdateCertificationSchema,
} from "shared";
import { z } from "zod";

export const certificationRoutes = new Hono<ContextWithPrisma>()
  .use(verifyUserRoleAccess("ADMIN"))
  .get("/", async (c) => {
    const certifications = await c.get("prisma").certification.findMany({
      orderBy: { description: "asc" },
    });

    return c.json<SuccessResponse<typeof certifications>>(
      {
        success: true,
        data: certifications,
        message: "Certifications retrieved successfully",
      },
      200,
    );
  })
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const certification = await c.get("prisma").certification.findUnique({
        where: { id },
      });

      if (!certification) {
        throw new HTTPException(404, { message: "certification not found" });
      }

      return c.json<SuccessResponse<typeof certification>>(
        {
          success: true,
          data: certification,
          message: "certification retrieved successfully",
        },
        200,
      );
    },
  )
  .post(
    "/",
    zValidator("json", CreateRefinedCertificationSchema),
    async (c) => {
      const data = c.req.valid("json");

      const newCertification = await c
        .get("prisma")
        .certification.create({ data });

      return c.json<SuccessResponse<typeof newCertification>>(
        {
          success: true,
          data: newCertification,
          message: "Certification created successfully",
        },
        201,
      );
    },
  )
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", UpdateCertificationSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const data = c.req.valid("json");

      const existing = await c
        .get("prisma")
        .certification.findUnique({ where: { id } });
      if (!existing) {
        throw new HTTPException(404, { message: "Certification not found" });
      }

      const updated = await c
        .get("prisma")
        .certification.update({ where: { id }, data });

      return c.json<SuccessResponse<typeof updated>>(
        {
          success: true,
          data: updated,
          message: "Certification updated successfully",
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
        .certification.findUnique({ where: { id } });
      if (!existing) {
        throw new HTTPException(404, { message: "Certification not found" });
      }

      await c.get("prisma").certification.delete({ where: { id } });

      return c.json<SuccessResponse>(
        { success: true, message: "Certification deleted successfully" },
        200,
      );
    },
  );
