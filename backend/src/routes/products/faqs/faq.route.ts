import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateFAQSchema, UpdateFAQSchema } from "shared";
import { z } from "zod";

export const faqRoutes = new Hono<ContextWithPrisma>()
  .use(verifyUserRoleAccess("ADMIN"))
  .get("/", async (c) => {
    const faqs = await c.get("prisma").fAQ.findMany();

    return c.json<SuccessResponse<typeof faqs>>(
      {
        success: true,
        data: faqs,
        message: "faqs retrieved successfully",
      },
      200,
    );
  })
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const faq = await c.get("prisma").fAQ.findUnique({
        where: { id },
      });

      if (!faq) {
        throw new HTTPException(404, { message: "faq not found" });
      }

      return c.json<SuccessResponse<typeof faq>>(
        {
          success: true,
          data: faq,
          message: "faq retrieved successfully",
        },
        200,
      );
    },
  )
  .post("/", zValidator("json", CreateFAQSchema), async (c) => {
    const data = c.req.valid("json");

    const newFAQ = await c.get("prisma").fAQ.create({ data });

    return c.json<SuccessResponse<typeof newFAQ>>(
      {
        success: true,
        data: newFAQ,
        message: "FAQ created successfully",
      },
      201,
    );
  })
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", UpdateFAQSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const data = c.req.valid("json");

      const existing = await c.get("prisma").fAQ.findUnique({ where: { id } });
      if (!existing) {
        throw new HTTPException(404, { message: "FAQ not found" });
      }

      const updated = await c.get("prisma").fAQ.update({ where: { id }, data });

      return c.json<SuccessResponse<typeof updated>>(
        {
          success: true,
          data: updated,
          message: "FAQ updated successfully",
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

      const existing = await c.get("prisma").fAQ.findUnique({ where: { id } });
      if (!existing) {
        throw new HTTPException(404, { message: "FAQ not found" });
      }

      await c.get("prisma").fAQ.delete({ where: { id } });

      return c.json<SuccessResponse>(
        { success: true, message: "FAQ deleted successfully" },
        200,
      );
    },
  );
