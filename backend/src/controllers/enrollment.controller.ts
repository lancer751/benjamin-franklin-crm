import type { Request, Response } from "express";
import { prisma } from "../config/connection";

export async function getEnrollments(req: Request, res: Response) {
  try {
    const enrollments = await prisma.matricula.findMany({
      include: {
        edicion: {
          include: {
            curso: {
              select: {
                nombre: true,
              },
            },
          },
        },
        cliente: {
          select: {
            nombre: true,
            apellido_materno: true,
            apellido_paterno: true,
          },
        },
      },
    });

    if (!enrollments) {
      return res.status(404).json({ error: "No enrollments found" });
    }

    const formattedEnrollments = enrollments.map((enroll) => ({
      id: enroll.id,
      customer: `${enroll.cliente.nombre} ${enroll.cliente.apellido_paterno} ${enroll.cliente.apellido_materno}`,
      coursename: enroll.edicion.curso.nombre,
      edicion_id: enroll.edicion_id,
      enrollment_date: enroll.createdAt,
    }));

    return res.status(200).json(formattedEnrollments);
  } catch (error) {
    console.error("[ENROLLMENT] getEnrollments failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getEnrollmentById(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Enrollment ID is required" });
  }

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Enrollment ID must be a string" });
  }

  try {
    const enrollment = await prisma.matricula.findUnique({
      where: { id },
      include: {
        edicion: {
          select: {
            moodle_course_id: true,
            fecha_inicio: true,
            fecha_finalizacion: true,
            id: true,
            modalidad: {
              select: {
                nombre: true,
              },
            },
            curso: {
              select: { nombre: true, duracion_semanas: true },
            },
          },
        },
        cliente: true,
      },
    });
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    const formattedEnrollment = {
      id: enrollment.id,
      cliente_id: enrollment.cliente_id,
      edicion_id: enrollment.edicion_id,
      moodle_course_id: enrollment.edicion.moodle_course_id,
      cliente: `${enrollment.cliente.nombre} ${enrollment.cliente.apellido_paterno} ${enrollment.cliente.apellido_materno}`,
      coursename: enrollment.edicion.curso.nombre,
      modalidad: enrollment.edicion.modalidad.nombre,
      fecha_inicio: enrollment.edicion.fecha_inicio,
      fecha_finalizacion: enrollment.edicion.fecha_finalizacion,
      enrollment_date: enrollment.createdAt,
    };

    return res.status(200).json(formattedEnrollment);
  } catch (error) {
    console.error("[ENROLLMENT] getEnrollmentById failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}