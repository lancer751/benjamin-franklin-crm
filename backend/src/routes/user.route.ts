import { Hono } from "hono";
import prisma from "../lib/prisma";
import { UUID_ROUTE } from "@/helpers/constants";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import {
  createSellerProfileSchema,
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
        role_id: true,
      },
      include: { role: { select: { name: true } } },
      orderBy: {
        created_at: "desc",
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

      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        omit: { role_id: true },
        include: { role: { select: { name: true } } },
      });

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
  // TODO: create a single endpoint to deliver users job details based on the role
  .get("/sellers", async (c) => {
    const sellers = await prisma.sellerProfile.findMany({
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            middle_name: true,
            is_active: true,
          },
        },
      },
    });

    const formattedSeller = sellers.map((seller) => {
      const { user, ...sellerDetails } = seller;

      return {
        ...sellerDetails,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name,
      };
    });

    return c.json(formattedSeller, 200);
  })
  // show seller details like sales_target and max_discount
  .get(
    `/sellers/:id`,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");
      const sellerDetails = await prisma.sellerProfile.findUnique({
        where: { id },
      });

      if (!sellerDetails) {
        throw new HTTPException(404, {
          message: "Seller not found. There's no seller profile with this id",
        });
      }

      return c.json<SuccessResponse<typeof sellerDetails>>(
        {
          success: true,
          message: "Seller Profile found successfully",
          data: sellerDetails,
        },
        200,
      );
    },
  )
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
  .post(
    "sellers/",
    zValidator("json", createSellerProfileSchema),
    async (c) => {
      const sellerProfileData = c.req.valid("json");

      const createdSellerProfile = await prisma.sellerProfile.create({
       data: sellerProfileData,
      });

      return c.json<SuccessResponse<typeof createdSellerProfile>>(
        {
          success: true,
          message: "seller profile created successfully",
          data: createdSellerProfile,
        },
        201,
      );
    },
  )
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
    "/sellers/:id",
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    zValidator("json", updateSellerProfileSchema),
    async (c) => {
      const id = c.req.param("id");
      const sellerData = c.req.valid("json");

      const existingSellerProfile = await prisma.sellerProfile.findUnique({
        where: { id },
      });
      if (!existingSellerProfile) {
        throw new HTTPException(404, { message: "Seller profile not found" });
      }
      const updatedSellerProfile = await prisma.sellerProfile.update({
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
