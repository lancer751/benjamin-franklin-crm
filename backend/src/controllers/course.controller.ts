import type { Request, Response } from "express";
import { prisma } from "../config/connection";

export async function getCourses(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(200, Number(req.query.limit ?? 20)); // prevent abusive large limits
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

    return res.json({
      data: courses,
      page,
      limit,
      total,
      hasMore: offset < total,
    });
  } catch (error) {
    console.error("getCourses failed:", error);
    return res.status(500).json({ error: "Failed to get courses" });
  }
}

export async function getCourseById(req: Request, res: Response) {
  const courseId = req.params.id;
  if (!courseId || typeof courseId !== "string") {
    return res.status(400).json({ error: "Invalid course ID" });
  }

  try {
    const course = await prisma.curso.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.json(course);
  } catch (error) {
    console.error("getCourseById failed:", error);
    return res.status(500).json({ error: "Failed to get course" });
  }
}

export async function createCourse(req: Request, res: Response) {
  try {
    const { nombre, descripcion, duracion_semanas } = req.body;

    if (!nombre || !duracion_semanas) {
      return res
        .status(400)
        .json({ error: "nombre and duracion_semanas are required" });
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

    return res
      .status(201)
      .json({ message: "Course created successfully", curso });
  } catch (error) {
    console.error("[COURSE] createCourse failed:", error);
    return res.status(500).json({ error: "Failed to create course" });
  }
}

export async function updateCourse(req: Request, res: Response) {
  const courseId = req.params.id;
  const { nombre, descripcion, duracion_semanas, edicion } = req.body;

  if (!courseId || typeof courseId !== "string") {
    return res.status(400).json({ error: "Invalid course ID" });
  }

  try {
    const existingCourse = await prisma.curso.findUnique({
      where: { id: courseId },
      include: { ediciones: true },
    });

    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
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
    return res.json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error in updateCourse:", error);
    return res.status(500).json({ error: "Failed to update course" });
  }
}

// export async function syncMoodleCourses(req: Request, res: Response) {
//     try {
//         const moodleCourses = await fetchCoursesFromMoodle()
//         const moodleIds = moodleCourses.map(course => course.id)

//         //Fetching existing courses from our database that either have a moodleCourseId
//         const existingCourses = await prisma.course.findMany({
//             where: {
//                 OR: [
//                     { moodleCourseId: { in: moodleIds } }
//                 ]
//             },
//             select: {
//                 id: true,
//                 description: true,
//                 name: true,
//                 moodleCourseId: true,
//                 createdAt: true
//             }
//         })

//         // Building fast lookup maps
//         const byMoodleId = new Map<number, typeof existingCourses[number]>();

//         for (const c of existingCourses) {
//             if (c.moodleCourseId !== null) byMoodleId.set(c.moodleCourseId, c)
//         }

//         // Prepare lists
//         type CreatePayload = {
//             moodleCourseId: number,
//             name: string,
//             description: string,
//         };
//         type UpdatePayload = {
//             courseId: number,
//             moodleCourseId: number,
//             name: string,
//             description: string,
//             startDate: number
//         };

//         const toCreate: CreatePayload[] = [];
//         const toUpdate: UpdatePayload[] = [];

//         for (const c of moodleCourses) {
//             const existing = byMoodleId.get(c.id)

//             if (!existing) {
//                 // NEW
//                 toCreate.push({
//                     moodleCourseId: c.id,
//                     description: c.description,
//                     name: c.name
//                 })
//             } else {
//                 toUpdate.push({
//                     courseId: existing.id, description: c.description, moodleCourseId: c.id, name: c.name, startDate: c.startdate
//                 })

//             }
//         }

//         // Bulk create new students (fast). createMany ignores relational fields and runs no hooks.
//         if (toCreate.length > 0) {
//             // createMany will ignore duplicates on unique constraints when skipDuplicates:true
//             await prisma.course.createMany({
//                 data: toCreate,
//                 skipDuplicates: true
//             });
//         }

//         // Batch-update existing students by their primary key id (safer & works for repaired rows)
//         const BATCH = 50;
//         for (let i = 0; i < toUpdate.length; i += BATCH) {
//             const batch = toUpdate.slice(i, i + BATCH);
//             await Promise.all(batch.map(c =>
//                 prisma.course.update({
//                     where: { id: c.courseId },              // use PK id (always present)
//                     data: {
//                         moodleCourseId: c.courseId,                  // IMPORTANT: repair stored moodleId
//                         name: c.name,
//                         description: c.description,
//                         createdAt: new Date(c.startDate)
//                     }
//                 })
//             ));
//         }

//         return res.json({
//             message: "Sync completed",
//             created: toCreate.length,
//             updated: toUpdate.length
//         });

//     } catch (error) {
//         console.error("syncMoodleCourses failed:", error);
//         return res.status(500).json({ error: "Failed to sync courses from Moodle" });
//     }
// }
