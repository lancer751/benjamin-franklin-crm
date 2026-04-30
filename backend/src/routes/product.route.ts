import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import {
  CreateCategorySchema,
  CreateProductSchema,
  UpdateProductSchema,
} from "shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import withPrisma from "@/lib/prisma";
import {z} from "zod";

export const productRoutes = new Hono<ContextWithPrisma>()
  // Get all products with filtering and pagination
  .get("/", withPrisma, async (c) => {
    const products = await c.get("prisma").product.findMany({
      include: {
        prices: true,
        edition: { include: {course: true} },
        campaing: true,
      }
    });
    return c.json(products, 200);
  })
  .get("/categories", withPrisma, async (c) => {
    const categories = await c.get("prisma").category.findMany();
    return c.json<SuccessResponse<typeof categories>>(
      {
        success: true,
        data: categories,
        message: "Categories retrieved successfully",
      },
      200,
    );
  })
  // Get product details
  .get(UUID_ROUTE, withPrisma, async (c) => {
    const { id } = c.req.param();
    const product = await c.get("prisma").product.findUnique({
      where: { id },
      include: {
        prices: true,
        edition: { include: {course: true}},
        category: true,
        orders_details: true,
      },
    });

    if (!product) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    return c.json<SuccessResponse<typeof product>>(
      {
        success: true,
        data: product,
        message: "Product retrieved successfully",
      },
      200,
    );
  })
  // Create new product
  .post("/", withPrisma, zValidator("json", CreateProductSchema), async (c) => {
    const { prices, ...productData } = c.req.valid("json");

    const existingEdition = await c.get("prisma").edition.findUnique({
      where: { id: productData.edition_id },
    });

    if (!existingEdition) {
      throw new HTTPException(400, { message: "Invalid edition_id" });
    }

    if (
      existingEdition.modality !== "HIBRIDO" &&
      prices.every((price) => price.attendance_mode !== "HEREDADO")
    ) {
      throw new HTTPException(400, {
        message:
          "HEREDADO attendance mode can only be used with VIRTUAL, PRESENCIAL AND ASINCRONO edition modality",
      });
    }

    const newProduct = await c.get("prisma").$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
          prices: {
            createMany: { data: prices },
          },
        },
        include: {
          prices: true,
          edition: true,
          category: true,
        },
      });

      return product;
    });

    return c.json<SuccessResponse<typeof newProduct>>(
      {
        success: true,
        data: newProduct,
        message: "Product created successfully",
      },
      201,
    );
  })
  //create new category
  .post(
    "/categories",
    withPrisma,
    zValidator("json", CreateCategorySchema),
    async (c) => {
      const categoryData = c.req.valid("json");
      const existingCategory = await c.get("prisma").category.findUnique({
        where: { name: categoryData.name },
      });

      if (existingCategory) {
        throw new HTTPException(400, {
          message: "Category with this name already exists",
        });
      }

      const newCategory = await c.get("prisma").category.create({
        data: categoryData,
      });

      return c.json<SuccessResponse<typeof newCategory>>(
        {
          success: true,
          data: newCategory,
          message: "Category created successfully",
        },
        201,
      );
    },
  )
  // Update product
  .put(
    UUID_ROUTE,
    withPrisma,
    zValidator("json", UpdateProductSchema),
    async (c) => {
      const { id } = c.req.param();
      const { prices, ...productData } = c.req.valid("json");

      const existingProduct = await c.get("prisma").product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new HTTPException(404, { message: "Product not found" });
      }

      const updatedProduct = await c.get("prisma").$transaction(async (tx) => {
        // If prices are provided, delete old ones and create new ones
        if (prices) {
          await tx.productPrice.deleteMany({
            where: { product_id: id },
          });
        }

        return tx.product.update({
          where: { id },
          data: {
            ...productData,
            prices: prices
              ? {
                  createMany: {
                    data: prices,
                  },
                }
              : undefined,
          },
          include: {
            prices: true,
            edition: true,
            category: true,
          },
        });
      });

      return c.json<SuccessResponse<typeof updatedProduct>>(
        {
          success: true,
          data: updatedProduct,
          message: "Product updated successfully",
        },
        200,
      );
    },
  )
  // Delete product
  .delete(UUID_ROUTE, withPrisma, async (c) => {
    const { id } = c.req.param();

    const existingProduct = await c.get("prisma").product.findUnique({
      where: { id },
      include: {
        orders_details: true,
      },
    });

    if (!existingProduct) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    // Prevent deletion if product is used in orders
    if (existingProduct.orders_details.length > 0) {
      throw new HTTPException(400, {
        message: "Cannot delete product that is used in existing orders",
      });
    }

    await c.get("prisma").product.delete({
      where: { id },
    });

    return c.json<SuccessResponse>(
      {
        success: true,
        message: "Product deleted successfully",
      },
      200,
    );
  })
  .delete(
    "/categories/:id",
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.param();
      const existingCategory = await c.get("prisma").category.findUnique({
        where: { id },
        include: {
          products: true,
        },
      });

      if (!existingCategory) {
        throw new HTTPException(404, { message: "Category not found" });
      }

      await c.get("prisma").category.delete({
        where: { id },
      });

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Category deleted successfully",
        },
        200,
      );
    },
  );
