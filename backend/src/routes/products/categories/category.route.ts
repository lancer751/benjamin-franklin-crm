import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateCategorySchema, UpdateCategorySchema } from "shared";
import { z } from "zod";

export const categoryRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/", async (c) => {
    const categories = await c.get("prisma").category.findMany({
      orderBy: { name: "asc" },
    });

    return c.json<SuccessResponse<typeof categories>>(
      { success: true, data: categories, message: "Categories retrieved successfully" },
      200,
    );
  })
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const category = await c.get("prisma").category.findUnique({
        where: { id },
        include: { products: true },
      });

      if (!category) {
        throw new HTTPException(404, { message: "Category not found" });
      }

      return c.json<SuccessResponse<typeof category>>(
        { success: true, data: category, message: "Category retrieved successfully" },
        200,
      );
    },
  )
  .post("/", zValidator("json", CreateCategorySchema), async (c) => {
    const data = c.req.valid("json");

    const existing = await c.get("prisma").category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new HTTPException(409, { message: "Category with this name already exists" });
    }

    const newCategory = await c.get("prisma").category.create({ data });

    return c.json<SuccessResponse<typeof newCategory>>(
      { success: true, data: newCategory, message: "Category created successfully" },
      201,
    );
  })
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", UpdateCategorySchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const data = c.req.valid("json");

      const existing = await c.get("prisma").category.findUnique({ where: { id } });
      if (!existing) {
        throw new HTTPException(404, { message: "Category not found" });
      }

      if (data.name && data.name !== existing.name) {
        const nameConflict = await c.get("prisma").category.findUnique({
          where: { name: data.name },
        });
        if (nameConflict) {
          throw new HTTPException(409, { message: "Category with this name already exists" });
        }
      }

      const updated = await c.get("prisma").category.update({ where: { id }, data });

      return c.json<SuccessResponse<typeof updated>>(
        { success: true, data: updated, message: "Category updated successfully" },
        200,
      );
    },
  )
  .delete(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const existing = await c.get("prisma").category.findUnique({
        where: { id },
        include: { products: { select: { id: true } } },
      });

      if (!existing) {
        throw new HTTPException(404, { message: "Category not found" });
      }

      if (existing.products.length > 0) {
        throw new HTTPException(409, {
          message: `Cannot delete category with ${existing.products.length} associated product(s)`,
        });
      }

      await c.get("prisma").category.delete({ where: { id } });

      return c.json<SuccessResponse>(
        { success: true, message: "Category deleted successfully" },
        200,
      );
    },
  );