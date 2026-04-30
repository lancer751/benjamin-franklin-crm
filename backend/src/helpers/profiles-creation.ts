import type { RoleAccess } from "@repo/database";
import type { Context } from "hono";
import { CreateSellerProfileSchema, type CreateUserDTO } from "shared";

// TODO apply generic type to make it reusable for other profiles
export async function createUserProfile(
  c: Context,
  userId: string,
  roleName: RoleAccess,
  userData: CreateUserDTO
) {
  if (roleName === "SALES_REP" && userData.seller_profile) {
    CreateSellerProfileSchema.parse(userData.seller_profile)
    return c.get("prisma").sellerProfile.create({
      data: {
        user_Id: userId,
        assigned_supervisor_id: userData.seller_profile.assigned_supervisor_id
      },
    });
  }

  if (roleName === "MARKETING") {
    return c.get("prisma").marketingProfile.create({
      data: {
        user_id: userId,
      },
    });
  }

  if (roleName === "SALES_SUPERVISOR") {
    return c.get("prisma").salesSupervisorProfile.create({
      data: {
        user_id: userId,
      },
    });
  }
}
