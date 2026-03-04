import type { Request, Response } from "express";
import { prisma } from "../config/connection";
import { createNewModdleStudent, enrolledStudentInMoodleCourse } from "../services/moodle.service";

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

export async function generateEnrollment(req: Request, res: Response) {
  const { cliente_id, edicion_id } = req.body;

  if (!cliente_id || !edicion_id) {
    return res
      .status(400)
      .json({ error: "cliente_id and edicion_id are required" });
  }

  if(typeof cliente_id !== "string" || typeof edicion_id !== "string"){
    return res
      .status(400)
      .json({ error: "invalid input for cliente_id and edicion_id" });
  }

  try {
    const cliente = await prisma.cliente.findUnique({
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

    const edicion = await prisma.edicion.findUnique({
      where: { id: edicion_id },
      select: { moodle_course_id: true },
    });

    if (!cliente || !edicion) {
      return res.status(400).json({ error: "edicion or cliente not found" });
    }

    if (!edicion.moodle_course_id) {
      return res
        .status(400)
        .json({ error: "No moddle_course_id associated to this edition" });
    }

    // it's better to make a query over the pago table
    const orderWasPaid = await prisma.compra.findFirst({where: {
      cliente_id,
      estado_order: "pagado",
      AND: {
        detalles: {
          some: {
            producto: {
              edicion_id
            }
          }
        }
      }
    }})

    if(!orderWasPaid) {
      return res.status(400).json({ error: "You can't enroll a client has not paid his order." });
    }

    if (cliente.moodle_user_id === null) {
      const newModdleStudent = await createNewModdleStudent({
        firstname: cliente.nombre,
        lastname: `${cliente.apellido_paterno} ${cliente.apellido_materno}`,
        email: cliente.email,
        username: cliente.dni,
        password: "password123",
      });

      await prisma.cliente.update({
        where: {id: cliente_id},
        data: {
          moodle_user_id: newModdleStudent?.data?.id
        }
      })
      console.log(newModdleStudent)
    }

    if (cliente.moodle_user_id !== null) {
      const isAlreadyEnrolledInEdition = await enrolledStudentInMoodleCourse(
        cliente.moodle_user_id,
        edicion.moodle_course_id,
      );
      console.log(isAlreadyEnrolledInEdition)
    }


  } catch (error) {
    console.error("[ENROLLMENT] createEnrollment failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
