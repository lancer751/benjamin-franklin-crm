import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import {
  CreateProductSchema,
  UpdateProductSchema,
} from "shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const productRoutes = new Hono<ContextWithPrisma>()
  // TODO: customize the products response to include pagination, filtering, etc.
  // morever we can also include the edition details in the response by using prisma's include feature
  .get("/", async (c) => {
    const products = await c.get("prisma").product.findMany({
      include: {
        productItems: {
          include: {
            edition: { include: { course: { select: { name: true } } } },
          },
        },
      },
    });
    return c.json(products, 200);
  })
  // product details
  // TODO : customize the product details response to include edition details, etc.
  .get(UUID_ROUTE, async (c) => {
    const { id } = c.req.param();
    const product = await c.get("prisma").product.findUnique({ where: { id } });
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
  .post("/", zValidator("json", CreateProductSchema), async (c) => {
    const { items, ...productData } = c.req.valid("json");

    const newProduct = await c.get("prisma").product.create({
      data: { ...productData, productItems: { createMany: { data: items } } },
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
  .put(UUID_ROUTE, zValidator("json", UpdateProductSchema), async (c) => {
    const { id } = c.req.param();
    const { items, ...productData } = c.req.valid("json");

    const existingProduct = await c
      .get("prisma")
      .product.findUnique({ where: { id } });

    if (!existingProduct) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    const updatedProduct = await c.get("prisma").$transaction(async (tx) => {
      if (items) {
        await tx.productItem.deleteMany({ where: { product_id: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          ...(items && {
            productItems: {
              createMany: {
                data: items.map((item) => ({ edition_id: item.edition_id })),
              },
            },
          }),
        },
        include: { productItems: true },
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
  })
  .delete(UUID_ROUTE, async (c) => {
    const { id } = c.req.param();
    const existingProduct = await c
      .get("prisma")
      .product.findUnique({ where: { id } });
    if (!existingProduct) {
      throw new HTTPException(404, { message: "Product not found" });
    }
    await c.get("prisma").product.delete({ where: { id } });
    return c.json<SuccessResponse>(
      {
        success: true,
        message: "Product deleted successfully",
      },
      200,
    );
  });
