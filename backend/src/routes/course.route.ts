import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import {
  CreateEditionSchema,
  CreateCourseSchema,
  UpdateEditionSchema,
  UpdateCourseSchema,
} from "shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import withPrisma from "@/lib/prisma";

export const courseRoutes = new Hono<ContextWithPrisma>()
  // Get all courses with filtering and pagination
  .get("/", withPrisma, async (c) => {
    const courses = await c.get("prisma").course.findMany({
      include: {
        benefits: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return c.json(
      {
        success: true,
        data: courses,
      },
      200,
    );
  })
  // Get course details with editions
  .get(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const course = await c.get("prisma").course.findUnique({
        where: { id },
        include: {
          benefits: true,
          editions: {
            include: {
              ownedProduct: true,
            },
          },
        },
      });

      if (!course) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      return c.json<SuccessResponse<typeof course>>(
        {
          success: true,
          message: "Course retrieved successfully",
          data: course,
        },
        200,
      );
    },
  )
  // Create new course
  .post("/", withPrisma, zValidator("json", CreateCourseSchema), async (c) => {
    const courseData = c.req.valid("json");

    const newCourse = await c.get("prisma").course.create({
      data: courseData,
      include: {
        benefits: true,
      },
    });

    return c.json<SuccessResponse<typeof newCourse>>(
      {
        success: true,
        message: "Course created successfully",
        data: newCourse,
      },
      201,
    );
  })
  // Update course
  .put(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", UpdateCourseSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const courseData = c.req.valid("json");

      const existingCourse = await c.get("prisma").course.findUnique({
        where: { id },
      });

      if (!existingCourse) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      const updatedCourse = await c.get("prisma").course.update({
        where: { id },
        data: courseData,
        include: {
          benefits: true,
        },
      });

      return c.json<SuccessResponse<typeof updatedCourse>>(
        {
          success: true,
          message: "Course updated successfully",
          data: updatedCourse,
        },
        200,
      );
    },
  )
  // Delete course
  .delete(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const existingCourse = await c.get("prisma").course.findUnique({
        where: { id },
        include: {
          editions: true,
        },
      });

      if (!existingCourse) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      // Prevent deletion if course has editions
      if (existingCourse.editions.length > 0) {
        throw new HTTPException(400, {
          message: "Cannot delete course that has editions",
        });
      }

      await c.get("prisma").course.delete({ where: { id } });

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Course deleted successfully",
        },
        200,
      );
    },
  )
  // ---- Edition Routes ----
  // Get all editions
  .get("/editions", withPrisma, async (c) => {
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
  // Get edition details
  .get(
    "/editions/:id",
    withPrisma,
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
          assigned_professors: true
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
    "/editions",
    withPrisma,
    zValidator("json", CreateEditionSchema),
    async (c) => {
      const editionData = c.req.valid("json");
      const { assigned_professors, ...plainEditionData } =
        structuredClone(editionData);

      const newEdition = await c.get("prisma").$transaction(async (tx) => {
        const createdEdition = await tx.edition.create({
          data: plainEditionData,
        });

        await c.get("prisma").proffessorsOnEditions.createMany({
          data: assigned_professors.map((professor) => ({
            professor_id: professor.id,
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
    "/editions/:id",
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", UpdateEditionSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const editionData = c.req.valid("json");
      const {
        assigned_professors: professorsUpdatedData,
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
          assigned_professors: true
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
    "/editions/:id",
    withPrisma,
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
  )
  // updating course details
  .put(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", UpdateCourseSchema),
    async (c) => {
      const id = c.req.param("id");
      const courseData = c.req.valid("json");

      const existingCourse = await c.get("prisma").course.findUnique({
        where: { id },
      });

      if (!existingCourse) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      const course = await c.get("prisma").course.update({
        where: { id },
        data: courseData,
      });
      return c.json<SuccessResponse<typeof course>>(
        {
          success: true,
          message: "Course updated successfully",
          data: course,
        },
        200,
      );
    },
<<<<<<< HEAD
  )
  // updating course edition details
  .put(
    `editions/${UUID_ROUTE}`,
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", UpdateEditionSchema),
    async (c) => {
      const editionId = c.req.param("id");
      const courseEditionData = c.req.valid("json");

      const existingCourseEdition = await c.get("prisma").edition.findUnique({
        where: { id: editionId },
      });

      if (!existingCourseEdition) {
        throw new HTTPException(404, { message: "Course Edition not found" });
      }

      const courseEdition = await c.get("prisma").edition.update({
        where: { id: editionId },
        data: courseEditionData,
      });
      return c.json<SuccessResponse<typeof courseEdition>>(
        {
          success: true,
          message: "Course edition updated successfully",
          data: courseEdition,
        },
        200,
      );
    },
  )
  // deleting a course
  .delete(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const id = c.req.param("id");

      const existingCourse = await c.get("prisma").course.findUnique({
        where: { id },
      });

      if (!existingCourse) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      await c.get("prisma").course.delete({ where: { id } });
      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Course deleted successfully",
        },
        200,
      );
    },
  )
  // deleting a course edition
  .delete(
    `/editions/${UUID_ROUTE}`,
    withPrisma,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const editionId = c.req.param("id");
      const courseEdition = await c.get("prisma").edition.findUnique({
        where: { id: editionId },
      });

      if (!courseEdition) {
        throw new HTTPException(404, { message: "Course Edition not found" });
      }

      await c.get("prisma").edition.delete({ where: { id: editionId } });
      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Course edition deleted successfully",
        },
        200,
      );
    },
=======
>>>>>>> origin/backend
  )