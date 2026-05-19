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
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";
import withPrisma from "@/lib/prisma";

export const productGeneralRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"))
  .get("/", async (c) => {
    const products = await c.get("prisma").product.findMany({
      include: {
        category: {
          omit: {
            created_at: true,
            updated_at: true,
          },
        },
        prices: {
          omit: {
            id: true,
            product_id: true,
          },
        },
        edition: {
          select: {
            id: true,
            start_date: true,
            end_date: true,
            schedules: {
              select: {
                day_of_week: true,
                type: true,
                slots: {
                  select: {
                    start_time: true,
                    end_time: true,
                  },
                },
              },
            },
            modality: true,
            hours_amount: true,
            classes_number: true,
            edition_number: true,
            edition_code: true,
            course: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      omit: {
        category_id: true,
        description: true,
        installments_max_number: true,
        installments_min_number: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return c.json(products, 200);
  })
  .get(UUID_ROUTE, async (c) => {
    const { id } = c.req.param();
    const product = await c.get("prisma").product.findUnique({
      where: { id },
      include: {
        prices: {
          omit: { id: true, product_id: true },
        },
        edition: {
          select: {
            course: {
              select: {
                name: true,
              },
            },
            classes_number: true,
            duration_unit: true,
            duration_value: true,
            edition_code: true,
            edition_number: true,
          },
        },
        category: { omit: { created_at: true, updated_at: true } },
        orders_details: true,
      },
      omit: {
        category_id: true,
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
  .post("/", zValidator("json", CreateProductSchema), async (c) => {
    const { prices, benefit_ids, faqs, certifications, ...productData } =
      c.req.valid("json");
    // if edition modality is HIBRIDO allow create 2 prices for each attendance mode, if not only send one price
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
      return tx.product.create({
        data: {
          ...productData,
          prices: {
            createMany: { data: prices },
          },
          relatedBenefits: {
            createMany: {
              data: benefit_ids.map((benefit_id) => ({ benefit_id })),
            },
          },
          frequentQuestions: {
            createMany: { data: faqs },
          },
          relatedCertifications: {
            createMany: { data: certifications },
          },
        },
        include: {
          prices: true,
          edition: true,
          category: true,
          relatedBenefits: true,
          frequentQuestions: true,
          relatedCertifications: true,
        },
      });
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
  })
  .delete(UUID_ROUTE, async (c) => {
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
  });
