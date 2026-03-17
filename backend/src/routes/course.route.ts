import { Hono } from "hono";
import prisma from "@lib/prisma";

export const courseRoutes = new Hono()
  .get("/", async (c) => {
    const page = Math.max(1, Number(c.req.query("page") ?? 1));
    const limit = Math.min(200, Number(c.req.query("limit") ?? 20));
    const skip = (page - 1) * limit;
    const offset = skip + limit;

    try {
      const courses = await prisma.curso.findMany({
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });
      const total = await prisma.curso.count();

      return c.json(
        {
          data: courses,
          page,
          limit,
          total,
          hasMore: offset < total,
        },
        200,
      );
    } catch (error) {
      console.error("getCourses failed:", error);
      return c.json({ error: "Failed to get courses" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const courseId = c.req.param("id");

    if (!courseId || typeof courseId !== "string") {
      return c.json({ error: "Invalid course ID" }, 400);
    }

    try {
      const course = await prisma.curso.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return c.json({ error: "Course not found" }, 404);
      }
      return c.json(course, 200);
    } catch (error) {
      console.error("getCourseById failed:", error);
      return c.json({ error: "Failed to get course" }, 500);
    }
  })
  .post("/", async (c) => {
    try {
      const { nombre, descripcion, duracion_semanas } = await c.req.json();

      if (!nombre || !duracion_semanas) {
        return c.json(
          { error: "nombre and duracion_semanas are required" },
          400,
        );
      }

      const curso = await prisma.curso.create({
        data: {
          nombre,
          descripcion: descripcion ?? null,
          duracion_semanas: Number(duracion_semanas),
          status: "activo",
        },
        include: { ediciones: true },
      });

      return c.json({ message: "Course created successfully", curso }, 201);
    } catch (error) {
      console.error("[COURSE] createCourse failed:", error);
      return c.json({ error: "Failed to create course" }, 500);
    }
  })
  .put("/:id", async (c) => {
    const courseId = c.req.param("id");
    const { nombre, descripcion, duracion_semanas, edicion } =
      await c.req.json();

    if (!courseId || typeof courseId !== "string") {
      return c.json({ error: "Invalid course ID" }, 400);
    }

    try {
      const existingCourse = await prisma.curso.findUnique({
        where: { id: courseId },
        include: { ediciones: true },
      });

      if (!existingCourse) {
        return c.json({ error: "Course not found" }, 404);
      }

      const updatedCourse = await prisma.curso.update({
        where: { id: courseId },
        data: {
          nombre: nombre,
          descripcion: descripcion,
          duracion_semanas: Number(duracion_semanas),
          ...(edicion ? { ediciones: { update: edicion } } : {}),
        },
      });
      return c.json(
        {
          message: "Course updated successfully",
          course: updatedCourse,
        },
        200,
      );
    } catch (error) {
      console.error("Error in updateCourse:", error);
      return c.json({ error: "Failed to update course" }, 500);
    }
  });
