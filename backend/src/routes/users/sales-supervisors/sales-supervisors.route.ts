import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import { validateIdParamSchema } from "@/helpers/params-validator";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { updateSalesSupervisorProfileSchema } from "shared";

export const salesSupervisorsRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/", async (c) => {
    const salesSupervisors = await c
      .get("prisma")
      .salesSupervisorProfile.findMany({
        include: {
          user: true,
        },
      });
    return c.json(
      {
        success: true,
        data: salesSupervisors,
      },
      200,
    );
  })
  .get(UUID_ROUTE, zValidator("param", validateIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");

    const supervisorDetails = await c
      .get("prisma")
      .salesSupervisorProfile.findUnique({
        where: { id },
        include: {
        user: true, // 👈 Traer nombre y apellido
        assignedSellers: { // Traer los datos de cada vendedor
        include: {
          user: true, 
        },
      },
      },
      });

    return c.json<SuccessResponse<typeof supervisorDetails>>(
      {
        success: true,
        message: "supervisorDetails retrieved successfully",
        data: supervisorDetails,
      },
      200,
    );
  })
  .put(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", validateIdParamSchema),
    zValidator("json", updateSalesSupervisorProfileSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const supervisorData = c.req.valid("json");

      const existingSupervisor = await c
        .get("prisma")
        .salesSupervisorProfile.findUnique({
          where: { id },
        });

      if (!existingSupervisor) {
        throw new HTTPException(404, {
          message: "Sales supervisor profile not found",
        });
      }

      const updatedSupervisorProfile = await c
        .get("prisma")
        .salesSupervisorProfile.update({
          where: { id },
          data: supervisorData,
        });

      return c.json<SuccessResponse<typeof updatedSupervisorProfile>>(
        {
          success: true,
          message: "Seller profile updated successfully",
          data: updatedSupervisorProfile,
        },
        200,
      );
    },
  );