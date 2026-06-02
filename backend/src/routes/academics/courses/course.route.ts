import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { CreateCourseSchema, UpdateCourseSchema } from "shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { verifyUserRoleAccess } from "@/middlewares/auth.middleware";

export const courseGeneralRoutes = new Hono<ContextWithPrisma>()
  .get(
    "/",
    verifyUserRoleAccess("SALES_SUPERVISOR", "SALES_REP", "ADMIN"),
    async (c) => {
      const courses = await c.get("prisma").course.findMany({
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
    },
  )
  .get(
    UUID_ROUTE,
    verifyUserRoleAccess("ADMIN"),
    zValidator("param", z.object({ id: z.uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const course = await c.get("prisma").course.findUnique({
        where: { id },
        include: {
          editions: {
            select: {
              id: true,
              edition_code: true,
              modality: true,
              duration_unit: true,
              duration_value: true,
              start_date: true,
              end_date: true,
              created_at: true,
              edition_status: true,
              edition_number: true,
              start_date: true,
              end_date: true,
            },
          },
          studyPlans: {
            include: {
              modules: true,
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
  .post(
    "/",
    verifyUserRoleAccess("ADMIN"),
    zValidator("json", CreateCourseSchema),
    async (c) => {
      const courseData = c.req.valid("json");

      const newCourse = await c.get("prisma").course.create({
        data: courseData,
      });

      return c.json<SuccessResponse<typeof newCourse>>(
        {
          success: true,
          message: "Course created successfully",
          data: newCourse,
        },
        201,
      );
    },
  )
  .put(
    UUID_ROUTE,
    verifyUserRoleAccess("ADMIN"),
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
  .delete(
    UUID_ROUTE,
    verifyUserRoleAccess("ADMIN"),
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
  );
