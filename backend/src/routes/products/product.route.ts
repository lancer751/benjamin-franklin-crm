import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { CreateRefinedProductSchema, UpdateProductSchema } from "shared";
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
        relatedBenefits: { select: { benefit_id: true } },
        frequentQuestions: { select: { faq_id: true } },
        relatedCertifications: { select: { certification_id: true } },
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
  .post("/", zValidator("json", CreateRefinedProductSchema), async (c) => {
    const { prices, benefit_ids, faq_ids, certification_ids, ...productData } =
      c.req.valid("json");

    const prisma = c.get("prisma");

    // ── 1. Verify edition exists and read its modality ─────────────────────
    const edition = await prisma.edition.findUnique({
      where: { id: productData.edition_id },
      select: { id: true, modality: true },
    });

    if (!edition) {
      throw new HTTPException(404, { message: "Edition not found" });
    }

    // ── 2. Enforce price rules based on modality ───────────────────────────
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

    // ── 3. Verify all referenced IDs exist (pre-flight, outside transaction) ─
    if (benefit_ids.length) {
      const found = await prisma.benefit.findMany({
        where: { id: { in: benefit_ids } },
        select: { id: true },
      });
      if (found.length !== benefit_ids.length) {
        const missing = benefit_ids.filter(
          (id) => !found.some((b) => b.id === id),
        );
        throw new HTTPException(404, {
          message: `Benefit IDs not found: ${missing.join(", ")}`,
        });
      }
    }

    if (faq_ids?.length) {
      const found = await prisma.fAQ.findMany({
        where: { id: { in: faq_ids } },
        select: { id: true },
      });
      if (found.length !== faq_ids.length) {
        const missing = faq_ids.filter((id) => !found.some((f) => f.id === id));
        throw new HTTPException(404, {
          message: `FAQ IDs not found: ${missing.join(", ")}`,
        });
      }
    }

    if (certification_ids?.length) {
      const found = await prisma.certification.findMany({
        where: { id: { in: certification_ids } },
        select: { id: true },
      });
      if (found.length !== certification_ids.length) {
        const missing = certification_ids.filter(
          (id) => !found.some((cert) => cert.id === id),
        );
        throw new HTTPException(404, {
          message: `Certification IDs not found: ${missing.join(", ")}`,
        });
      }
    }

    //  4. Check edition doesn't already have a product
    const editionProductConflict = await prisma.product.findUnique({
      where: { edition_id: productData.edition_id },
      select: { id: true, name: true },
    });

    if (editionProductConflict) {
      throw new HTTPException(409, {
        message: `Edition already has a product linked to it: "${editionProductConflict.name}"`,
      });
    }

    // ── 5. Transaction ─────────────────────────────────────────────────────
    const newProduct = await prisma.$transaction(async (tx) => {
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
          // Join table rows for many-to-many — pass the faq_id, Prisma
          // fills product_id automatically from the relation context
          frequentQuestions: faq_ids?.length
            ? { createMany: { data: faq_ids.map((faq_id) => ({ faq_id })) } }
            : undefined,
          relatedCertifications: certification_ids?.length
            ? {
                createMany: {
                  data: certification_ids.map((certification_id) => ({
                    certification_id,
                  })),
                },
              }
            : undefined,
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
  })
  .put(UUID_ROUTE, zValidator("json", UpdateProductSchema), async (c) => {
    const { id } = c.req.param();
    const { prices, benefit_ids, faq_ids, certification_ids, ...productData } =
      c.req.valid("json");

    const prisma = c.get("prisma");

    // ── 1. Verify product exists ───────────────────────────────────────────
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        edition: { select: { modality: true } },
      },
    });

    if (!existingProduct) {
      throw new HTTPException(404, { message: "Product not found" });
    }

    // ── 2. Validate prices against modality if prices are being updated ────
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
        if (prices.length !== 1 || prices[0]?.attendance_mode !== "HEREDADO") {
          throw new HTTPException(400, {
            message: `Non-HIBRIDO editions (${modality}) require exactly 1 price with attendance_mode HEREDADO`,
          });
        }
      }
    }

    // ── 3. Pre-flight checks for relation IDs ──────────────────────────────
    if (benefit_ids?.length) {
      const found = await prisma.benefit.findMany({
        where: { id: { in: benefit_ids } },
        select: { id: true },
      });
      if (found.length !== benefit_ids.length) {
        const missing = benefit_ids.filter(
          (bid) => !found.some((b) => b.id === bid),
        );
        throw new HTTPException(404, {
          message: `Benefit IDs not found: ${missing.join(", ")}`,
        });
      }
    }

    if (faq_ids?.length) {
      const found = await prisma.fAQ.findMany({
        where: { id: { in: faq_ids } },
        select: { id: true },
      });
      if (found.length !== faq_ids.length) {
        const missing = faq_ids.filter(
          (fid) => !found.some((f) => f.id === fid),
        );
        throw new HTTPException(404, {
          message: `FAQ IDs not found: ${missing.join(", ")}`,
        });
      }
    }

    if (certification_ids?.length) {
      const found = await prisma.certification.findMany({
        where: { id: { in: certification_ids } },
        select: { id: true },
      });
      if (found.length !== certification_ids.length) {
        const missing = certification_ids.filter(
          (cid) => !found.some((cert) => cert.id === cid),
        );
        throw new HTTPException(404, {
          message: `Certification IDs not found: ${missing.join(", ")}`,
        });
      }
    }

    // ── 4. Transaction — replace strategy for all relation arrays ──────────
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Prices — replace if provided
      if (prices?.length) {
        await tx.productPrice.deleteMany({ where: { product_id: id } });
      }

      // Benefits — replace if provided
      if (benefit_ids !== undefined) {
        await tx.benefitsOnProduct.deleteMany({ where: { product_id: id } });
      }

      // FAQs — replace if provided
      if (faq_ids !== undefined) {
        await tx.fAQsOnProduct.deleteMany({ where: { product_id: id } });
      }

      // Certifications — replace if provided
      if (certification_ids !== undefined) {
        await tx.certificationsOnProduct.deleteMany({
          where: { product_id: id },
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          prices: prices?.length ? { createMany: { data: prices } } : undefined,
          relatedBenefits: benefit_ids?.length
            ? {
                createMany: {
                  data: benefit_ids.map((benefit_id) => ({ benefit_id })),
                },
              }
            : undefined,
          frequentQuestions: faq_ids?.length
            ? {
                createMany: {
                  data: faq_ids.map((faq_id) => ({ faq_id })),
                },
              }
            : undefined,
          relatedCertifications: certification_ids?.length
            ? {
                createMany: {
                  data: certification_ids.map((certification_id) => ({
                    certification_id,
                  })),
                },
              }
            : undefined,
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
