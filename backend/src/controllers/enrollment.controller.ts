import type { Request, Response } from "express";
import { prisma } from "../config/connection";
import {
  createNewModdleStudent,
  enrolledStudentInMoodleCourse,
  enrollStudentsInMoodle,
} from "../services/moodle.service";

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
      status: enroll.estado,
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
      status: enrollment.estado,
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

export async function generateEnrollment(req: Request, res: Response) {
  const { cliente_id, edicion_id } = req.body;
  const MOODLE_STUDENT_ROLE = 5;

  if (!cliente_id || !edicion_id) {
    return res
      .status(400)
      .json({ error: "cliente_id and edicion_id are required" });
  }

  if (typeof cliente_id !== "string" || typeof edicion_id !== "string") {
    return res
      .status(400)
      .json({ error: "invalid input for cliente_id and edicion_id" });
  }

  try {
    const clientePromise = prisma.cliente.findUnique({
      where: { id: cliente_id },
      select: {
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        dni: true,
        email: true,
        moodle_user_id: true,
      },
    });

    const edicionPromise = prisma.edicion.findUnique({
      where: { id: edicion_id },
      select: {
        moodle_course_id: true,
        id: true,
        curso: {
          select: { nombre: true },
        },
      },
    });

    const [cliente, edicion] = await Promise.all([
      clientePromise,
      edicionPromise,
    ]);

    if (!cliente) {
      return res.status(404).json({ error: "Client not found" });
    }

    if (!edicion) {
      return res.status(404).json({ error: "Edition not found" });
    }

    if (!edicion.moodle_course_id) {
      return res
        .status(400)
        .json({ error: "No moodle_course_id associated to this edition" });
    }

    // Check if client has already enrolled in this edition
    const existingEnrollment = await prisma.matricula.findFirst({
      where: {
        cliente_id,
        edicion_id,
      },
    });

    if (existingEnrollment) {
      return res.status(409).json({
        error: "Client is already enrolled in this edition",
      });
    }

    // Verify payment
    const orderWasPaid = await prisma.pago.findFirst({
      where: {
        compra: {
          cliente_id,
          estado_order: "pagado",
          detalles: {
            some: {
              producto: {
                edicion_id,
              },
            },
          },
        },
      },
    });

    if (!orderWasPaid) {
      return res.status(400).json({
        error:
          "Client must have a paid order for this edition before enrolling",
      });
    }

    // If client doesn't have a Moodle account, create one
    if (cliente.moodle_user_id === null) {
      const newMoodleStudent = await createNewModdleStudent({
        firstname: cliente.nombre,
        lastname: `${cliente.apellido_paterno} ${cliente.apellido_materno}`,
        email: cliente.email,
        username: cliente.dni,
        password: "password123",
      });

      if (!newMoodleStudent.success) {
        console.error(
          "[ENROLLMENT] Failed to create Moodle student:",
          newMoodleStudent.error
        );
        return res.status(400).json({
          error: "Failed to create Moodle account for client",
        });
      }

      // Update client with Moodle user ID
      await prisma.cliente.update({
        where: { id: cliente_id },
        data: {
          moodle_user_id: newMoodleStudent.data.id,
        },
      });

      // Enroll in Moodle course
      await enrollStudentsInMoodle({
        userid: newMoodleStudent.data.id,
        courseid: edicion.moodle_course_id,
        roleid: MOODLE_STUDENT_ROLE,
      });
    } else {
      // Client has Moodle account - verify not already enrolled in course
      const isAlreadyEnrolled = await enrolledStudentInMoodleCourse(
        cliente.moodle_user_id,
        edicion.moodle_course_id
      );

      if (!isAlreadyEnrolled.success) {
        console.error(
          "[ENROLLMENT] Failed to check Moodle enrollment:",
          isAlreadyEnrolled.error
        );
        return res.status(400).json({
          error: "Failed to verify Moodle enrollment status",
        });
      }

      if (isAlreadyEnrolled.isEnrolled) {
        return res.status(409).json({
          error: `Client is already enrolled in Moodle course (ID: ${edicion.moodle_course_id})`,
        });
      }

      // Enroll in Moodle course
      await enrollStudentsInMoodle({
        userid: cliente.moodle_user_id,
        courseid: edicion.moodle_course_id,
        roleid: MOODLE_STUDENT_ROLE,
      });
    }

    // Create enrollment record
    const newEnrollment = await prisma.matricula.create({
      data: {
        estado: "activo",
        cliente_id,
        edicion_id,
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
          },
        },
        edicion: {
          select: {
            id: true,
            moodle_course_id: true,
            curso: {
              select: { nombre: true },
            },
          },
        },
      },
    });

    const formattedEnrollment = {
      id: newEnrollment.id,
      customer: `${newEnrollment.cliente.nombre} ${newEnrollment.cliente.apellido_paterno} ${newEnrollment.cliente.apellido_materno}`,
      coursename: newEnrollment.edicion.curso.nombre,
      edicion_id: newEnrollment.edicion_id,
      moodle_course_id: newEnrollment.edicion.moodle_course_id,
      status: newEnrollment.estado,
      enrollment_date: newEnrollment.createdAt,
    };

    return res.status(201).json(formattedEnrollment);
  } catch (error) {
    console.error("[ENROLLMENT] generateEnrollment failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateEnrollmentStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { estado } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Enrollment ID is required" });
  }

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Enrollment ID must be a string" });
  }

  if (!estado) {
    return res.status(400).json({ error: "Estado is required" });
  }

  const validEstados = ["activo", "retirado", "completado"];
  if (!validEstados.includes(estado)) {
    return res.status(400).json({
      error: `Invalid estado. Must be one of: ${validEstados.join(", ")}`,
    });
  }

  try {
    const existingEnrollment = await prisma.matricula.findUnique({
      where: { id },
    });

    if (!existingEnrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    const updatedEnrollment = await prisma.matricula.update({
      where: { id },
      data: {
        estado,
      },
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

    const formattedEnrollment = {
      id: updatedEnrollment.id,
      customer: `${updatedEnrollment.cliente.nombre} ${updatedEnrollment.cliente.apellido_paterno} ${updatedEnrollment.cliente.apellido_materno}`,
      status: updatedEnrollment.estado,
      coursename: updatedEnrollment.edicion.curso.nombre,
      edicion_id: updatedEnrollment.edicion_id,
      estado: updatedEnrollment.estado,
      enrollment_date: updatedEnrollment.createdAt,
      updated_date: updatedEnrollment.updatedAt,
    };

    return res.status(200).json(formattedEnrollment);
  } catch (error) {
    console.error("[ENROLLMENT] updateEnrollment failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

