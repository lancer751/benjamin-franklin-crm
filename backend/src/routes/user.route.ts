import { Hono } from "hono";
import { UUID_ROUTE } from "@/helpers/constants";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import {
  CreateSellerProfileSchema,
  CreateUserSchema,
  UpdateSellerProfileSchema,
  UpdateUserSchema,
  RoleAccessSchema,
} from "shared";
import type { SuccessResponse } from "@/app";
import withPrisma from "@/lib/prisma";
import type { ContextWithPrisma } from "@/lib/contextVariables";

export const userRoutes = new Hono<ContextWithPrisma>()
  // Get all users
  .get("/", withPrisma, async (c) => {
    const users = await c.get("prisma").user.findMany({
      select: {
        id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        email: true,
        cellphone: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        role: { select: { name: true, description: true } },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return c.json(
      {
        success: true,
        data: users,
      },
      200
    );
  })
  // Get user details by ID
  .get(UUID_ROUTE, withPrisma, zValidator("param", z.object({ id: z.string().uuid().length(36) })), async (c) => {
    const { id } = c.req.valid("param");

    const user = await c.get("prisma").user.findUnique({
      where: { id },
      select: {
        id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        email: true,
        cellphone: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        role: { select: { name: true, description: true } },
        marketing: true,
        seller: {
          select: {
            id: true,
            sales_target: true,
            total_sales: true,
            total_orders: true,
            completed_orders: true,
          },
        },
      },
    });

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    return c.json<SuccessResponse<typeof user>>(
      {
        success: true,
        message: "User retrieved successfully",
        data: user,
      },
      200
    );
  })
  // Get all sellers
  .get("/sellers", withPrisma, async (c) => {
    const sellers = await c.get("prisma").sellerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            email: true,
            is_active: true,
          },
        },
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
      200
    );
  })
  // Get seller details by ID
  .get("/sellers/:id", withPrisma, zValidator("param", z.object({ id: z.string().uuid().length(36) })), async (c) => {
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
      200
    );
  })
  // Get all marketers
  .get("/marketers", withPrisma, async (c) => {
    const marketers = await c.get("prisma").marketingProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            email: true,
            is_active: true,
          },
        },
      },
    });

    return c.json(
      {
        success: true,
        data: marketers,
      },
      200
    );
  })
  // Get all roles
  .get("/roles", withPrisma, async (c) => {
    const roles = await c.get("prisma").role.findMany({});

    return c.json(
      {
        success: true,
        data: roles,
      },
      200
    );
  })
  // Create new user
  .post("/", withPrisma, zValidator("json", CreateUserSchema), async (c) => {
    const userData = c.req.valid("json");

    // Verify role exists
    const roleExists = await c.get("prisma").role.findUnique({
      where: { id: userData.role_id },
    });

    if (!roleExists) {
      throw new HTTPException(400, { message: "Invalid role ID" });
    }

    const newUser = await c.get("prisma").user.create({
      data: userData,
      include: {
        role: { select: { name: true } },
      },
    });

    return c.json<SuccessResponse<typeof newUser>>(
      {
        success: true,
        message: "User created successfully",
        data: newUser,
      },
      201
    );
  })
  // Create seller profile
  .post("/sellers", withPrisma, zValidator("json", CreateSellerProfileSchema), async (c) => {
    const sellerData = c.req.valid("json");

    // Verify user exists
    const userExists = await c.get("prisma").user.findUnique({
      where: { id: sellerData.user_id },
    });

    if (!userExists) {
      throw new HTTPException(400, { message: "User not found" });
    }

    // Check if seller profile already exists for this user
    const existingProfile = await c.get("prisma").sellerProfile.findUnique({
      where: { user_id: sellerData.user_id },
    });

    if (existingProfile) {
      throw new HTTPException(400, {
        message: "Seller profile already exists for this user",
      });
    }

    const createdSellerProfile = await c.get("prisma").sellerProfile.create({
      data: sellerData,
      include: {
        user: true,
      },
    });

    return c.json<SuccessResponse<typeof createdSellerProfile>>(
      {
        success: true,
        message: "Seller profile created successfully",
        data: createdSellerProfile,
      },
      201
    );
  })
  // Update user
  .put(UUID_ROUTE, withPrisma, zValidator("param", z.object({ id: z.string().uuid().length(36) })), zValidator("json", UpdateUserSchema), async (c) => {
    const { id } = c.req.valid("param");
    const userData = c.req.valid("json");

    const existingUser = await c.get("prisma").user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new HTTPException(404, { message: "User not found" });
    }

    // If role_id is being updated, verify it exists
    if (userData.role_id) {
      const roleExists = await c.get("prisma").role.findUnique({
        where: { id: userData.role_id },
      });

      if (!roleExists) {
        throw new HTTPException(400, { message: "Invalid role ID" });
      }
    }

    const updatedUser = await c.get("prisma").user.update({
      where: { id },
      data: userData,
      include: {
        role: { select: { name: true } },
      },
    });

    return c.json<SuccessResponse<typeof updatedUser>>(
      {
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      },
      200
    );
  })
  // Update seller profile
  .put("/sellers/:id", withPrisma, zValidator("param", z.object({ id: z.string().uuid().length(36) })), zValidator("json", UpdateSellerProfileSchema), async (c) => {
    const { id } = c.req.valid("param");
    const sellerData = c.req.valid("json");

    const existingSellerProfile = await c.get("prisma").sellerProfile.findUnique({
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
      200
    );
  })
  // Delete user
  .delete(UUID_ROUTE, withPrisma, zValidator("param", z.object({ id: z.string().uuid().length(36) })), async (c) => {
    const { id } = c.req.valid("param");

    const existingUser = await c.get("prisma").user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new HTTPException(404, { message: "User not found" });
    }

    await c.get("prisma").user.delete({
      where: { id },
    });

    return c.json<SuccessResponse>(
      {
        success: true,
        message: "User deleted successfully",
      },
      200
    );
  })
  // update user details
  .put(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    zValidator("json", UpdateUserSchema),
    async (c) => {
      const id = c.req.param("id");
      const userData = c.req.valid("json");

      const updatedUser = await c.get("prisma").user.update({
        where: { id },
        data: userData,
      });
      return c.json<SuccessResponse<typeof updatedUser>>(
        {
          success: true,
          message: "User updated successfully",
          data: updatedUser,
        },
        200,
      );
    },
  )
  // update seller profile
  .put(
    "/sellers/:id",
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    zValidator("json",UpdateSellerProfileSchema),
    async (c) => {
      const id = c.req.param("id");
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
  )
  // for now we just return the roles, but in the future we can add more details to the roles like permissions and access levels