import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import {
  createCourseEditionSchema,
  createCourseSchema,
  createModalitySchema,
  updateCourseEditionSchema,
  updateCourseSchema,
} from "@/zod-schemas/course.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

export const courseRoutes = new Hono<ContextWithPrisma>()
  // getting all courses
  // TODO: add pagination for filtering and sorting courses data
  .get("/", async (c) => {
    const courses = await c.get("prisma").course.findMany({});
    return c.json(courses, 200);
  })
  // getting course details
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    async (c) => {
      const id = c.req.param("id");

      const course = await c.get("prisma").course.findUnique({
        where: { id },
        include: {
          editions: {
            omit: {
              course_id: true,
              modality_id: true,
            },
            include: {
              modality: {
                select: { name: true },
              },
            },
          },
        },
      });

      if (!course) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      const formattedEditions = course.editions.map((edt) => ({
        ...edt,
        modality: edt.modality.name,
      }));
      const formattedCourse = { ...course, editions: formattedEditions };

      return c.json<SuccessResponse<typeof formattedCourse>>(
        {
          success: true,
          message: "Course retrieved successfully",
          data: formattedCourse,
        },
        201,
      );
    },
  )
  // getting  course editions
  // TODO: add pagination for filtering and sorting course editions data
  .get("/editions", async (c) => {
    const courseEditions = await c.get("prisma").edition.findMany({
      omit: { course_id: true, modality_id: true },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            image_url: true
          },
        },
        modality: {
          select: { name: true },
        },
        campaing: {
          omit: {edition_id: true}
        }
      },
      orderBy: {
        created_at: "desc"
      }
    });

    const formattedCourseEditions = courseEditions.map((ced) => ({
      ...ced,
      modality: ced.modality.name,
      campaing: ced.campaing
    }));
    return c.json(formattedCourseEditions, 200);
  })
  // getting course edition details
  .get(
    `/editions${UUID_ROUTE}`,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const editionId = c.req.param("id");
      console.log(editionId)
      const courseEdition = await c.get("prisma").edition.findUnique({
        where: { id: editionId },
        omit: { modality_id: true, course_id: true },
        include: {
          modality: {
            select: { name: true },
          },
          course: true,
        },
      });

      if (!courseEdition) {
        throw new HTTPException(404, { message: "Course Edition not found" });
      }

      const clonedEdition = structuredClone(courseEdition);
      const formattedEdition = {
        ...clonedEdition,
        modality: clonedEdition.modality.name,
      };

      return c.json<SuccessResponse<typeof formattedEdition>>(
        {
          success: true,
          message: "Course edition retrieved successfully",
          data: formattedEdition,
        },
        200,
      );
    },
  )
  // creating a new course
  .post("/", zValidator("json", createCourseSchema), async (c) => {
    const courseData = c.req.valid("json");
    const course = await c.get("prisma").course.create({ data: courseData });
    return c.json<SuccessResponse<typeof course>>(
      {
        success: true,
        message: "Course created successfully",
        data: course,
      },
      201,
    );
  })
  // creating a new course edition
  .post(
    "/editions",
    zValidator("json", createCourseEditionSchema),
    async (c) => {
      const courseEditionData = c.req.valid("json");
      const courseEdition =  await c.get("prisma").edition.create({
        data: courseEditionData,
      });

      return c.json<SuccessResponse<typeof courseEdition>>(
        {
          success: true,
          message: "Course edition created successfully",
          data: courseEdition,
        },
        201,
      );
    },
  )
  // updating course details
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", updateCourseSchema),
    async (c) => {
      const id = c.req.param("id");
      const courseData = c.req.valid("json");

      const existingCourse =  await c.get("prisma").course.findUnique({
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
  )
  // updating course edition details
  .put(
    `editions${UUID_ROUTE}`,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", updateCourseEditionSchema),
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
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const id = c.req.param("id");

      const existingCourse =  await c.get("prisma").course.findUnique({
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
    `/editions${UUID_ROUTE}`,
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
  )
  .get("/modalities", async (c) => {
    const modalities = await c.get("prisma").modality.findMany({});
    return c.json(modalities, 200);
  })
  .post("/modalities", zValidator("json", createModalitySchema), async (c) => {
    const modalityData = c.req.valid("json");
    const modality = await c.get("prisma").modality.create({ data: modalityData });
    return c.json<SuccessResponse<typeof modality>>(
      {
        success: true,
        message: "Modality created successfully",
        data: modality,
      },
      201,
    );
  })
  .put(
    "/modalities/:modalityId",
    zValidator("param", z.object({ modalityId: z.uuid().length(36) })),
    // Create a separate scheme for modality creation and update if needed, for now we are using the same scheme for both operations, because modality only has one field
    zValidator("json", createModalitySchema),
    async (c) => {
      const modalityId = c.req.param("modalityId");
      const modalityData = c.req.valid("json");

      const existingModality = await c.get("prisma").modality.findUnique({
        where: { id: modalityId },
      });

      if (!existingModality) {
        throw new HTTPException(404, { message: "Modality not found" });
      }

      const modality =await c.get("prisma").modality.update({
        where: { id: modalityId },
        data: modalityData,
      });
      return c.json<SuccessResponse<typeof modality>>(
        {
          success: true,
          message: "Modality updated successfully",
          data: modality,
        },
        200,
      );
    },
  );
