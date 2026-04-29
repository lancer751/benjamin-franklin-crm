import type { SuccessResponse } from "@/app";
import { validateIdParamSchema } from "@/helpers/params-validator";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { UpdateSellerProfileSchema } from "shared";

export const sellersRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/", async (c) => {
    const sellers = await c.get("prisma").sellerProfile.findMany({
      include: {
        user: true
      },
      orderBy: {
        total_sales: "desc",
      },
    });

    return c.json(
      {
        success: true,
        data: sellers,
      },
      200,
    );
  })
  // Get seller details by ID
  .get(
    "/sellers/:id",
    zValidator("param", validateIdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");

      const sellerDetails = await c.get("prisma").sellerProfile.findUnique({
        where: { id },
        include: {
          user: true,
          campaignMembers: true,
          orders: true,
        },
      });

      if (!sellerDetails) {
        throw new HTTPException(404, {
          message: "Seller profile not found",
        });
      }

      return c.json<SuccessResponse<typeof sellerDetails>>(
        {
          success: true,
          message: "Seller profile retrieved successfully",
          data: sellerDetails,
        },
        200,
      );
    },
  )
  .put(
    "/sellers/:id",
    withPrisma,
    zValidator("param", validateIdParamSchema),
    zValidator("json", UpdateSellerProfileSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const sellerData = c.req.valid("json");

      const existingSellerProfile = await c
        .get("prisma")
        .sellerProfile.findUnique({
          where: { id },
        });

      if (!existingSellerProfile) {
        throw new HTTPException(404, { message: "Seller profile not found" });
      }

      const updatedSellerProfile = await c.get("prisma").sellerProfile.update({
        where: { id },
        data: sellerData,
        include: {
          user: true,
        },
      });

      return c.json<SuccessResponse<typeof updatedSellerProfile>>(
        {
          success: true,
          message: "Seller profile updated successfully",
          data: updatedSellerProfile,
        },
        200,
      );
    },
  );
