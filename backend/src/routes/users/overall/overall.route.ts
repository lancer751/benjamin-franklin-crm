import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import { validateIdParamSchema } from "@/helpers/params-validator";
import { createUserProfile } from "@/helpers/profiles-creation";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  CreateSellerProfileSchema,
  CreateUserSchema,
  UpdateUserSchema,
} from "shared";

export const userGeneralRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  // all users
  .get("/", async (c) => {
    const users = await c.get("prisma").user.findMany({
      include: {
        role: { select: { id: true, name: true } },
      },
      omit: {
        password: true,
        role_id: true,
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
      200,
    );
  })
  // user details by id
  .get(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", validateIdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");

      const user = await c.get("prisma").user.findUnique({
        where: { id },
        include: {
          role: { select: { name: true } },
          seller: true
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
        200,
      );
    },
  )
  // Create a new user and its profile based on the role
  .post("/", withPrisma, zValidator("json", CreateUserSchema), async (c) => {
    const userData = c.req.valid("json");
    const { seller_profile, ...userFields } = userData;

    // Verify role exists
    const existingRole = await c.get("prisma").role.findUnique({
      where: { id: userFields.role_id },
    });

    if (!existingRole) {
      throw new HTTPException(400, { message: "Invalid role ID" });
    }

    const newUser = await c.get("prisma").user.create({
      data: userFields,
      include: {
        role: { select: { name: true } },
      },
    });

    // TODO - Create a better zod Schema for creating user with profile 
    if (newUser.role.name === "SALES_REP" && seller_profile) {
      await c.get("prisma").sellerProfile.create({
        data: {
          user_id: newUser.id,
          assigned_supervisor_id: seller_profile.assigned_supervisor_id,
        },
      });
    } 

    if (newUser.role.name === "MARKETING") {
      await c.get("prisma").marketingProfile.create({
        data: {
          user_id: newUser.id,
        },
      });
    }

    if (newUser.role.name === "SALES_SUPERVISOR") {
      await c.get("prisma").salesSupervisorProfile.create({
        data: {
          user_id: newUser.id,
        },
      });
    }

    return c.json<SuccessResponse<typeof newUser>>(
      {
        success: true,
        message: "User created successfully",
        data: newUser,
      },
      201,
    );
  })
  // Update user
  .put(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", validateIdParamSchema),
    zValidator("json", UpdateUserSchema),
    async (c) => {
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
        200,
      );
    },
  )
  .delete(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", validateIdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");

      const existingUser = await c.get("prisma").user.findUnique({
        where: { id },
        include: {
          role: { select: { name: true } },
        },
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
        200,
      );
    },
  )
  // get all roles
  .get("/roles", withPrisma, async (c) => {
    const roles = await c.get("prisma").role.findMany({});

    return c.json(
      {
        success: true,
        data: roles,
      },
      200,
    );
  });
