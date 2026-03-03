import type { Request, Response } from "express";
import { prisma } from "../config/connection";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        apellido_materno: true,
        apellido_paterno: true,
        nombre: true,
        email: true,
        telefono: true,
        role: true,
      },
    });
    return res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function getUserById(req: Request, res: Response) {
  const userId = req.params.id;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        apellido_materno: true,
        apellido_paterno: true,
        nombre: true,
        email: true,
        telefono: true,
        role: {
          select: { nombre: true },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error(`Error fetching user with id ${userId}:`, error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function createUser(req: Request, res: Response) {
  const {
    apellido_materno,
    apellido_paterno,
    nombre,
    email,
    telefono,
    roleId,
    password,
  } = req.body;
  if (
    !apellido_materno ||
    !apellido_paterno ||
    !nombre ||
    !email ||
    !roleId ||
    !password
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newUser = await prisma.usuario.create({
      data: {
        apellido_materno,
        apellido_paterno,
        nombre,
        email,
        telefono: telefono ?? null,
        role: { connect: { id: roleId } },
        password,
      },
      select: {
        id: true,
        apellido_materno: true,
        apellido_paterno: true,
        nombre: true,
        email: true,
        telefono: true,
        role: {
          select: { nombre: true },
        },
      },
    });
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
}

export async function updateUser(req: Request, res: Response) {
  const userId = req.params.id;
  const {
    apellido_materno,
    apellido_paterno,
    nombre,
    email,
    telefono,
    roleId,
    password,
  } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const existingUser = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if(!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: {
        apellido_materno,
        apellido_paterno,
        nombre,
        email,
        telefono: telefono ?? null,
        role: roleId ? { connect: { id: roleId } } : undefined,
        password,
      },
      select: {
        id: true,
        apellido_materno: true,
        apellido_paterno: true,
        nombre: true,
        email: true,
        telefono: true,
        role: {
          select: { nombre: true },
        },
      },
    });
    return res.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user with id ${userId}:`, error);
    return res.status(500).json({ error: "Failed to update user" });
  }
}
//Getting all students from moodles with pagination

// export async function getStudents(req: Request, res: Response): Promise<Response<StudentResults> | Response<{ error: string }>> {
//   const page = Math.max(1, Number(req.query.page ?? 1));
//   const limit = Math.min(200, Number(req.query.limit ?? 20)); // prevent abusive large limits
//   const skip = (page - 1) * limit;

//   try {

//     // later, here will be selecting the status of the user not of the enrollment.
//     // we only will tell if the user was added to Moodle
//     const [students, total] = await Promise.all([
//       prisma.student.findMany({
//         skip,
//         take: limit,
//         orderBy: { lastName: "asc" }, // or whatever order you want
//         select: {
//           id: true,
//           moodleId: true,
//           firstName: true,
//           lastName: true,
//           email: true,
//           dni: true,
//           phone: true,
//           username: true,
//         }
//       }),
//       prisma.student.count()
//     ]);

//     return res.json({
//       data: students,
//       page,
//       limit,
//       total,
//       hasMore: skip + students.length < total
//     });
//   } catch (error) {
//     console.error("getStudents failed:", error);
//     return res.status(500).json({ error: "Failed to get students" });
//   }
// }

// controllers/moodle.controller.ts (fixed)
// export async function syncMoodleUsers(req: Request, res: Response) {
//   try {
//     const moodleUsers = await fetchUsersFromModdle(); // [{ id, username, firstName, lastName, fullName, email }, ...]
//     const moodleIds = moodleUsers.map(u => u.id);
//     const emails = moodleUsers.map(u => u.email).filter(Boolean);

//     // Fetch existing students that either have moodleId in the list OR have a matching email
//     const existingStudents = await prisma.student.findMany({
//       where: {
//         OR: [
//           { moodleId: { in: moodleIds } },
//           { email: { in: emails } }
//         ]
//       },
//       select: {
//         id: true,
//         moodleId: true,
//         email: true,
//         username: true
//       }
//     });

//     // Build fast lookup maps
//     const byMoodleId = new Map<number, typeof existingStudents[number]>();
//     const byEmail = new Map<string, typeof existingStudents[number]>();

//     for (const s of existingStudents) {
//       if (s.moodleId !== null) byMoodleId.set(s.moodleId, s);
//       if (s.email) byEmail.set(s.email, s);
//     }

//     // Prepare lists
//     type CreatePayload = {
//       moodleId: number,
//       username: string,
//       firstName: string,
//       lastName: string,
//       fullName: string,
//       email: string
//     };
//     type UpdatePayload = {
//       studentId: number,
//       moodleId: number,
//       username: string,
//       firstName: string,
//       lastName: string,
//       email: string
//     };

//     const toCreate: CreatePayload[] = [];
//     const toUpdate: UpdatePayload[] = [];

//     for (const u of moodleUsers) {
//       // Prefer match by moodleId, fallback to email
//       const existing = byMoodleId.get(u.id) ?? byEmail.get(u.email);

//       if (!existing) {
//         // NEW: do NOT set primary key `id` here
//         toCreate.push({
//           moodleId: u.id,
//           username: u.username,
//           firstName: u.firstName,
//           lastName: u.lastName,
//           fullName: u.fullName,
//           email: u.email
//         });
//       } else {
//         // Update existing row and ensure moodleId is set (repair)
//         toUpdate.push({
//           studentId: existing.id,
//           moodleId: u.id,
//           username: u.username,
//           firstName: u.firstName,
//           lastName: u.lastName,
//           email: u.email
//         });
//       }
//     }

//     // Bulk create new students (fast). createMany ignores relational fields and runs no hooks.
//     if (toCreate.length > 0) {
//       // createMany will ignore duplicates on unique constraints when skipDuplicates:true
//       await prisma.student.createMany({
//         data: toCreate,
//         skipDuplicates: true
//       });
//     }

//     // Batch-update existing students by their primary key id (safer & works for repaired rows)
//     const BATCH = 50;
//     for (let i = 0; i < toUpdate.length; i += BATCH) {
//       const batch = toUpdate.slice(i, i + BATCH);
//       await Promise.all(batch.map(u =>
//         prisma.student.update({
//           where: { id: u.studentId },              // use PK id (always present)
//           data: {
//             moodleId: u.moodleId,                  // IMPORTANT: repair stored moodleId
//             username: u.username,
//             firstName: u.firstName,
//             lastName: u.lastName,
//             email: u.email
//           }
//         })
//       ));
//     }

//     return res.json({
//       message: "Sync completed",
//       created: toCreate.length,
//       updated: toUpdate.length
//     });

//   } catch (error) {
//     console.error("Error syncing Moodle users:", error);
//     return res.status(500).json({ error: "Failed to sync Moodle users" });
//   }
// }
