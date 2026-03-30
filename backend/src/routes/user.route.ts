import { Hono } from "hono";
import prisma from "../lib/prisma";
import { UUID_ROUTE } from "@/helpers/constants";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import {
  createUserSchema,
  updateSellerProfileSchema,
  updateUserSchema,
} from "@/zod-schemas/user.schema";
import type { SuccessResponse } from "@/app";

export const userRoutes = new Hono()
  // get all users
  .get("/", async (c) => {
    const users = await prisma.user.findMany({
      omit: {
        password: true,
      },
    });
    return c.json(users, 200);
  })
  //get user details by id
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    async (c) => {
      const id = c.req.param("id");

      const user = await prisma.user.findUniqueOrThrow({ where: { id } });
      if (!user) {
        throw new HTTPException(404, { message: "User don't found" });
      }
      return c.json<SuccessResponse<typeof user>>(
        {
          success: true,
          message: "User found successfully",
          data: user,
        },
        200,
      );
    },
  )
  .get("/sellers", async (c) => {
    const sellers = await prisma.sellerProfile.findMany({});
    return c.json<SuccessResponse<typeof sellers>>(
      {
        success: true,
        message: "Sellers found successfully",
        data: sellers,
      },
      200,
    );
  })
  .get("/marketers", async (c) => {
    const marketers = await prisma.marketingProfile.findMany({});
    return c.json<SuccessResponse<typeof marketers>>(
      {
        success: true,
        message: "Marketers found successfully",
        data: marketers,
      },
      200,
    );
  })
  // get seller profile by user id
  .get(
    "/sellers/:user_id",
    zValidator("param", z.object({ user_id: z.uuid().min(36).max(36) })),
    async (c) => {
      const user_id = c.req.param("user_id");

      const seller = await prisma.sellerProfile.findUnique({
        where: { user_id },
      });
      if (!seller) {
        throw new HTTPException(404, { message: "Seller profile not found" });
      }
      return c.json<SuccessResponse<typeof seller>>(
        {
          success: true,
          message: "Seller profile found successfully",
          data: seller,
        },
        200,
      );
    },
  )
  // create new user with role-based profile creation
  // from here we create the user and the profile based on the role selected
  .post("/", zValidator("json", createUserSchema), async (c) => {
    const userData = c.req.valid("json");

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      const selectedRole = await tx.role.findUnique({
        where: { id: user.role_id },
        select: { name: true },
      });

      if (!selectedRole) {
        throw new HTTPException(400, { message: "Invalid role ID" });
      }

      switch (selectedRole.name) {
        case "SALES_REP": {
          await tx.sellerProfile.create({ data: { user_id: user.id } });
          break;
        }
        case "MARKETING": {
          await tx.marketingProfile.create({ data: { user_id: user.id } });
          break;
        }
      }

      return user;
    });

    return c.json<SuccessResponse<typeof newUser>>(
      {
        success: true,
        message: "User created successfully",
        data: newUser,
      },
      201,
    );
  })
  // update user details
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    zValidator("json", updateUserSchema),
    async (c) => {
      const id = c.req.param("id");
      const userData = c.req.valid("json");

      const updatedUser = await prisma.user.update({
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
    "/sellers/:user_id",
    zValidator("param", z.object({ user_id: z.uuid().min(36).max(36) })),
    zValidator("json", updateSellerProfileSchema),
    async (c) => {
      const user_id = c.req.param("user_id");
      const sellerData = c.req.valid("json");

      const updatedSellerProfile = await prisma.sellerProfile.update({
        where: { user_id },
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
  // delete user by id
  .delete(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    async (c) => {
      const id = c.req.param("id");

      await prisma.user.delete({
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
  // for now we just return the roles, but in the future we can add more details to the roles like permissions and access levels
  .get("/roles", async (c) => {
    const roles = await prisma.role.findMany({});
    return c.json(roles, 200);
  });