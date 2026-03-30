import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import prisma from "@/lib/prisma";
import {
  createCourseEditionSchema,
  createCourseSchema,
  updateCourseEditionSchema,
  updateCourseSchema,
} from "@/zod-schemas/course.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

export const courseRoutes = new Hono()
  .get("/", async (c) => {
    const courses = await prisma.course.findMany({});
    return c.json(courses, 200);
  })
  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().min(36).max(36) })),
    async (c) => {
      const id = c.req.param("id");

      const course = await prisma.course.findUnique({
        where: { id },
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
        201,
      );
    },
  )
  .get("/editions", async (c) => {
    const courseEditions = await prisma.edition.findMany({});
    return c.json(courseEditions, 200);
  })
  .get(
    "/editions/:editionId",
    zValidator("param", z.object({ editionId: z.uuid().length(36) })),
    async (c) => {
      const editionId = c.req.param("editionId");
      const courseEdition = await prisma.edition.findUnique({
        where: { id: editionId },
      });

      if (!courseEdition) {
        throw new HTTPException(404, { message: "Course Edition not found" });
      }

      return c.json<SuccessResponse<typeof courseEdition>>(
        {
          success: true,
          message: "Course edition retrieved successfully",
          data: courseEdition,
        },
        201,
      );
    },
  )
  .post("/", zValidator("json", createCourseSchema), async (c) => {
    const courseData = c.req.valid("json");
    const course = await prisma.course.create({ data: courseData });
    return c.json<SuccessResponse<typeof course>>(
      {
        success: true,
        message: "Course created successfully",
        data: course,
      },
      201,
    );
  })
  .post(
    "/editions",
    zValidator("json", createCourseEditionSchema),
    async (c) => {
      const courseEditionData = c.req.valid("json");
      const courseEdition = await prisma.edition.create({
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
  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    zValidator("json", updateCourseSchema),
    async (c) => {
      const id = c.req.param("id");
      const courseData = c.req.valid("json");

      const existingCourse = await prisma.course.findUnique({
        where: { id },
      });

      if (!existingCourse) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      const course = await prisma.course.update({
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
  .put(
    "/editions/:editionId",
    zValidator("param", z.object({ editionId: z.uuid().length(36) })),
    zValidator("json", updateCourseEditionSchema),
    async (c) => {
      const editionId = c.req.param("editionId");
      const courseEditionData = c.req.valid("json");

      const existingCourseEdition = await prisma.edition.findUnique({
        where: { id: editionId },
      });

      if (!existingCourseEdition) {
        throw new HTTPException(404, { message: "Course Edition not found" });
      }

      const courseEdition = await prisma.edition.update({
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
  .delete(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const id = c.req.param("id");

      const existingCourse = await prisma.course.findUnique({
        where: { id },
      });

      if (!existingCourse) {
        throw new HTTPException(404, { message: "Course not found" });
      }

      await prisma.course.delete({ where: { id } });
      return c.json<SuccessResponse<null>>(
        {
          success: true,
          message: "Course deleted successfully",
          data: null,
        },
        200,
      );
    },
  )
  .delete(
    "/editions/:editionId",
    zValidator("param", z.object({ editionId: z.uuid().length(36) })),
    async (c) => {
      const editionId = c.req.param("editionId");
      const courseEdition = await prisma.edition.findUnique({
        where: { id: editionId },
      });

      if (!courseEdition) {
        throw new HTTPException(404, { message: "Course Edition not found" });
      }

      await prisma.edition.delete({ where: { id: editionId } });
      return c.json<SuccessResponse<null>>(
        {
          success: true,
          message: "Course edition deleted successfully",
          data: null,
        },
        200,
      );
    },
  );
