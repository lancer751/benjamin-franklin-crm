import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { CreateEditionSchema, UpdateEditionSchema } from "shared";
import { z } from "zod";

export const editionRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/", async (c) => {
    const courseEditions = await c.get("prisma").edition.findMany({
      include: {
        course: {
          select: {
            id: true,
            name: true,
            image_url: true,
            code: true,
          },
        },
        schedules: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return c.json(
      {
        success: true,
        data: courseEditions,
      },
      200,
    );
  })
  .get(
    UUID_ROUTE,

    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const courseEdition = await c.get("prisma").edition.findUnique({
        where: { id },
        include: {
          course: true,
          schedules: {
            include: {
              slots: true,
            },
          },
          assigned_professors: true,
        },
      });

      if (!courseEdition) {
        throw new HTTPException(404, { message: "Course edition not found" });
      }

      return c.json<SuccessResponse<typeof courseEdition>>(
        {
          success: true,
          message: "Course edition retrieved successfully",
          data: courseEdition,
        },
        200,
      );
    },
  )
  // Create new edition
  .post(
    "/",

    zValidator("json", CreateEditionSchema),
    async (c) => {
      const editionData = c.req.valid("json");
      const { assigned_professors, schedules, ...plainEditionData } =
        structuredClone(editionData);

      const newEdition = await c.get("prisma").$transaction(async (tx) => {
        const createdEdition = await tx.edition.create({
          data: plainEditionData,
        });

        await c.get("prisma").proffessorsOnEditions.createMany({
          data: assigned_professors.map((professor) => ({
            professor_id: professor.professor_id,
            edition_id: createdEdition.id,
          })),
        });

        return await tx.edition.findUnique({
          where: { id: createdEdition.id },
          include: {
            course: true,
            assigned_professors: true,
          },
        });
      });

      return c.json<SuccessResponse<typeof newEdition>>(
        {
          success: true,
          message: "Course edition created successfully",
          data: newEdition,
        },
        201,
      );
    },
  )
  // Update edition
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", UpdateEditionSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const editionData = c.req.valid("json");
      const {
        assigned_professors: professorsUpdatedData,
        schedules,
        ...editionUpdatesPlainData
      } = structuredClone(editionData);

      const existingEdition = await c.get("prisma").edition.findUnique({
        where: { id },
      });

      if (!existingEdition) {
        throw new HTTPException(404, { message: "Course edition not found" });
      }

      const updatedEdition = await c.get("prisma").edition.update({
        where: { id },
        data: {
          ...editionUpdatesPlainData,
          ...(professorsUpdatedData && {
            assigned_professors: {
              updateMany: {
                where: { edition_id: id },
                data: professorsUpdatedData,
              },
            },
          }),
        },
        include: {
          course: true,
          assigned_professors: true,
        },
      });

      return c.json<SuccessResponse<typeof updatedEdition>>(
        {
          success: true,
          message: "Course edition updated successfully",
          data: updatedEdition,
        },
        200,
      );
    },
  )
  // Delete edition
  .delete(
    UUID_ROUTE,

    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const existingEdition = await c.get("prisma").edition.findUnique({
        where: { id },
        include: {
          schedules: true,
        },
      });

      if (!existingEdition) {
        throw new HTTPException(404, { message: "Course edition not found" });
      }

      // this must be in products
      // Prevent deletion if edition has campaign or schedules
      // if (existingEdition.campaing || existingEdition.schedules.length > 0) {
      //   throw new HTTPException(400, {
      //     message: "Cannot delete edition that has associated campaigns or schedules",
      //   });
      // }

      await c.get("prisma").edition.delete({ where: { id } });

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Course edition deleted successfully",
        },
        200,
      );
    },
  );