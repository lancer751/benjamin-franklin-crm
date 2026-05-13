import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import { validateIdParamSchema } from "@/helpers/params-validator";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import type { RoleAccess } from "@repo/database";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateUserSchema } from "shared";
import { hash } from "bcrypt";

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

    zValidator("param", validateIdParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");

      const user = await c.get("prisma").user.findUnique({
        where: { id },
        include: {
          role: { select: { name: true } },
          seller: true,
          salesSupervisor: true
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
  .post(
    "/",

    zValidator("json", CreateUserSchema),
    async (c) => {
      const userData = c.req.valid("json");
      const prisma = c.get("prisma");
      const { role, ...profilesAndUserFields } = structuredClone(userData);

      const existingUser = await c.get("prisma").user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new HTTPException(400, { message: "Email already in use" });
      }

      // Verify role exists
      const existingRole = await prisma.role.findUnique({
        where: { id: profilesAndUserFields.role_id },
      });

      if (!existingRole) {
        throw new HTTPException(400, { message: "Invalid role ID" });
      }

      if (existingRole.name !== role) {
        throw new HTTPException(400, {
          message: `Role mismatch: role_id belongs to '${existingRole.name}' but declared role is '${role}'`,
        });
      }

      // Strip all possible profile fields — they're unknown at this point
      const {
        seller_profile,
        sales_supervisor_profile,
        marketing_profile,
        ...userFields
      } = {
        seller_profile: undefined,
        sales_supervisor_profile: undefined,
        marketing_profile: undefined,
        ...profilesAndUserFields, // actual values override the undefined defaults above
      };

      const hashedPassword = await hash(userData.password, 10);

      const newUserAccountAndProfile = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { ...userFields, password: hashedPassword },
          include: { role: { select: { name: true } } },
        });

        const profileCreators: Record<RoleAccess, () => Promise<void>> = {
          SALES_REP: async () => {
            await tx.sellerProfile.create({
              data: {
                user_id: user.id,
                assigned_supervisor_id: seller_profile!.assigned_supervisor_id,
                sales_target: seller_profile!.sales_target,
              },
            });
          },
          SALES_SUPERVISOR: async () => {
            await tx.salesSupervisorProfile.create({
              data: { user_id: user.id, ...sales_supervisor_profile! },
            });
          },
          MARKETING: async () => {
            await tx.marketingProfile.create({
              data: { user_id: user.id },
            });
          },
          ADMIN: async () => {
            // Admins don't have a separate profile, so we can just return here
            return;
          },
          COLLECTIONS: async () => {
            // Collections role doesn't have a separate profile, so we can just return here
            return;
          },
        };

        await profileCreators[role]?.();
        return user;
      });

      return c.json<SuccessResponse<typeof newUserAccountAndProfile>>(
        {
          success: true,
          message: "User created successfully",
          data: newUserAccountAndProfile,
        },
        201,
      );
    },
  )
  // Update user
  // .put(
  //   UUID_ROUTE,
  //   withPrisma,
  //   zValidator("param", validateIdParamSchema),
  //   zValidator("json", UpdateUserSchema),
  //   async (c) => {
  //     const { id } = c.req.valid("param");
  //     const userData = c.req.valid("json");

  //     const existingUser = await c.get("prisma").user.findUnique({
  //       where: { id },
  //     });

  //     if (!existingUser) {
  //       throw new HTTPException(404, { message: "User not found" });
  //     }

  //     // If role_id is being updated, verify it exists
  //     if (userData.role_id) {
  //       const roleExists = await c.get("prisma").role.findUnique({
  //         where: { id: userData.role_id },
  //       });

  //       if (!roleExists) {
  //         throw new HTTPException(400, { message: "Invalid role ID" });
  //       }
  //     }

  //     const updatedUser = await c.get("prisma").user.update({
  //       where: { id },
  //       data: userData,
  //       include: {
  //         role: { select: { name: true } },
  //       },
  //     });

  //     return c.json<SuccessResponse<typeof updatedUser>>(
  //       {
  //         success: true,
  //         message: "User updated successfully",
  //         data: updatedUser,
  //       },
  //       200,
  //     );
  //   },
  // )
  .delete(
    UUID_ROUTE,

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
  .get("/roles", async (c) => {
    const roles = await c.get("prisma").role.findMany({});

    return c.json(
      {
        success: true,
        data: roles,
      },
      200,
    );
  });
