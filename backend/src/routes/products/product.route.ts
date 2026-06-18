import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import {
  CreateRefinedProductSalesContentSchema,
  UpdateProductSalesContentSchema,
} from "shared";

export const productGeneralRoutes = new Hono<ContextWithPrisma>()
  .get("/", async (c) => {
    const products = await c.get("prisma").product.findMany({
      select: {
        id: true,
        image_url: true,
        name: true,
        sales_status: true,
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
          },
        },
        pricing_status: true,
        updated_at: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return c.json(products, 200);
  })
  .get(UUID_ROUTE, async (c) => {
    const { id } = c.req.param();
    console.log(Date.now() / 1000 - (Math.floor(Date.now() / 1000) + 60 * 5));

    const product = await c.get("prisma").product.findUnique({
      where: { id },
      select: {
        id: true,
        discount_expires_at: true,
        discount_price: true,
        installments_max_number: true,
        installments_min_number: true,
        name: true,
        image_url: true,
        updated_at: true,
        pricing_status: true,
        presale_price: true,
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
            id: true,
            edition_status: true,
            modality: true,
            start_date: true,
            end_date: true,
            hours_amount: true,
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
  .post(
    "/",
    verifyUserRoleAccess("ADMIN"),
    zValidator("json", CreateRefinedProductSalesContentSchema),
    async (c) => {
      const { prices, ...productData } = c.req.valid("json");

      const prisma = c.get("prisma");

      // 1. Verify edition exists and read its modality
      const edition = await prisma.edition.findUnique({
        where: { id: productData.edition_id },
        select: { id: true, modality: true, edition_status: true },
      });

      if (!edition) {
        throw new HTTPException(404, { message: "Edition not found" });
      }

      //  2. Enforce price rules based on modality
      //
      //  HIBRIDO  → exactly 2 prices: one VIRTUAL + one PRESENCIAL
      //  anything else → exactly 1 price with attendance_mode HEREDADO
      //
      if (
        edition.modality !== "HIBRIDO" &&
        prices.every((price) => price.attendance_mode !== "HEREDADO")
      ) {
        throw new HTTPException(400, {
          message:
            "HEREDADO attendance mode can only be used with VIRTUAL, PRESENCIAL AND ASINCRONO edition modality",
        });
      }

      if (
        edition.modality === "HIBRIDO" &&
        prices.some((pr) => pr.attendance_mode === "HEREDADO")
      ) {
        throw new HTTPException(400, {
          message:
            "HEREDADO attendance mode cannot be used with HIBRIDO edition modality",
        });
      }

      if (edition.modality === "HIBRIDO" && prices.length !== 2) {
        throw new HTTPException(400, {
          message:
            "HIBRIDO edition modality requires exactly 2 prices: one VIRTUAL and one PRESENCIAL",
        });
      }
      if (edition.modality !== "HIBRIDO" && prices.length !== 1) {
        throw new HTTPException(400, {
          message: `Non-HIBRIDO edition modality requires exactly 1 price with attendance_mode HEREDADO`,
        });
      }

      //  3. Check edition doesn't already have a product
      const editionProductConflict = await prisma.product.findUnique({
        where: { edition_id: productData.edition_id },
        select: { id: true, name: true },
      });

      if (editionProductConflict) {
        throw new HTTPException(409, {
          message: `Edition already has a product linked to it: "${editionProductConflict.name}"`,
        });
      }

      const BLOCKING_EDITION_STATUSES = [
        "DRAFT",
        "CANCELLED",
        "COMPLETED",
        "IN_PROGRESS",
      ];

      if (BLOCKING_EDITION_STATUSES.includes(edition.edition_status)) {
        throw new HTTPException(400, {
          message: `Cannot create product for edition with status ${edition.edition_status}. Please change the edition status to SCHEDULED or COMPLETED before creating a product for it.`,
        });
      }

      //  4. Transaction
      const newProduct = await prisma.$transaction(async (tx) => {
        return tx.product.create({
          data: {
            ...productData,
            prices: {
              createMany: { data: prices },
            },
          },
          include: {
            prices: true,
            edition: {
              select: {
                id: true,
                modality: true,
                start_date: true,
                end_date: true,
                edition_code: true,
                course: { select: { name: true } },
              },
            },
            category: { omit: { created_at: true, updated_at: true } },
            relatedBenefits: { include: { benefits: true } },
            frequentQuestions: { include: { faq: true } },
            relatedCertifications: { include: { certification: true } },
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
    },
  )
  .put(
    UUID_ROUTE,
    verifyUserRoleAccess("ADMIN"),
    zValidator("json", UpdateProductSalesContentSchema),
    async (c) => {
      const { id } = c.req.param();
      const { prices, ...productData } = c.req.valid("json");
      const prisma = c.get("prisma");

      //  1. Verify product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: {
          id: true,
          edition: { select: { modality: true } },
          prices: true,
          pricing_status: true,
        },
      });

      if (!existingProduct) {
        throw new HTTPException(404, { message: "Product not found" });
      }

      const productHasBeenInvalidated =
        existingProduct.pricing_status === "INVALID";

      if (productHasBeenInvalidated && existingProduct.prices.length !== 0) {
        throw new HTTPException(400, {
          message:
            "Product has invalid pricing due to edition modality change. Please update the prices to match the edition modality before updating the product.",
        });
      }

      //  2. Validate prices against modality if prices are being updated
      if (prices && prices.length > 0) {
        const modality = existingProduct.edition.modality;

        if (modality === "HIBRIDO") {
          const modes = prices.map((p) => p.attendance_mode);
          if (
            prices.length !== 2 ||
            !modes.includes("VIRTUAL") ||
            !modes.includes("PRESENCIAL") ||
            modes.includes("HEREDADO")
          ) {
            throw new HTTPException(400, {
              message:
                "HIBRIDO editions require exactly 2 prices: one VIRTUAL and one PRESENCIAL",
            });
          }
        } else {
          if (
            prices.length !== 1 ||
            prices[0]?.attendance_mode !== "HEREDADO"
          ) {
            throw new HTTPException(400, {
              message: `Non-HIBRIDO editions (${modality}) require exactly 1 price with attendance_mode HEREDADO`,
            });
          }
        }
      }

      // ── 4. Transaction — replace strategy for all relation arrays ──────────
      const updatedProduct = await prisma.$transaction(async (tx) => {
        // Prices — replace if provided
        if (prices?.length) {
          await tx.productPrice.deleteMany({ where: { product_id: id } });
        }

        return tx.product.update({
          where: { id },
          data: {
            ...productData,
            prices: prices?.length
              ? { createMany: { data: prices } }
              : undefined,
            pricing_status: productHasBeenInvalidated ? "VALID" : undefined,
          },
          include: {
            prices: true,
            edition: {
              select: {
                id: true,
                modality: true,
                start_date: true,
                end_date: true,
                edition_code: true,
                course: { select: { name: true } },
              },
            },
            category: { omit: { created_at: true, updated_at: true } },
            relatedBenefits: { include: { benefits: true } },
            frequentQuestions: { include: { faq: true } },
            relatedCertifications: { include: { certification: true } },
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
  .delete(UUID_ROUTE, verifyUserRoleAccess("ADMIN"), async (c) => {
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
