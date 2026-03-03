// Enrollment service (DB-level logic)
// Handles creating Matricula records, preventing duplicates, and orchestrating
// Moodle simulation + email notifications.

import { prisma } from "../config/connection";
import { simulateMoodleEnrollment } from "./moodle.service";
import { sendEnrollmentSuccessEmail } from "./email.service";

export interface EnrollResult {
  success: boolean;
  matriculaId?: string;
  alreadyEnrolled?: boolean;
  error?: string;
}

/**
 * Enrolls a customer (cliente_id) into a course (curso_id).
 * - Prevents duplicate enrollments.
 * - Simulates Moodle enrollment.
 * - Sends a simulated email.
 */
export async function enrollClientInCourse(
  clienteId: string,
  cursoId: string,
): Promise<EnrollResult> {
  try {
    // 1. Check for duplicate enrollment
    const existing = await prisma.matricula.findFirst({
      where: { cliente_id: clienteId, curso_id: cursoId },
    });

    if (existing) {
      console.log(
        `⚠️ [ENROLLMENT] Cliente ${clienteId} is already enrolled in course ${cursoId}`,
      );
      return { success: true, alreadyEnrolled: true, matriculaId: existing.id };
    }

    // 2. Fetch client + course info for emails and Moodle
    const [cliente, curso] = await Promise.all([
      prisma.cliente.findUnique({ where: { id: clienteId } }),
      prisma.curso.findUnique({
        where: { id: cursoId },
        include: { ediciones: { take: 1 } },
      }),
    ]);

    if (!cliente)
      return { success: false, error: `Cliente ${clienteId} not found` };
    if (!curso) return { success: false, error: `Curso ${cursoId} not found` };

    // 3. Simulate Moodle enrollment
    const moodleCourseId = curso.ediciones[0]?.moodle_course_id ?? null;
    const moodleResult = await simulateMoodleEnrollment(
      cliente.email,
      moodleCourseId,
    );

    // 4. Create Matricula record inside a transaction
    const matricula = await prisma.matricula.create({
      data: {
        cliente_id: clienteId,
        curso_id: cursoId,
        estado: "activo",
        moodle_enrollment_id: moodleResult.moodleEnrollmentId ?? null,
      },
    });

    // 5. Send simulated confirmation email
    sendEnrollmentSuccessEmail(
      cliente.email,
      `${cliente.nombre} ${cliente.apellido_paterno}`,
      curso.nombre,
    );

    console.log(
      `✅ [ENROLLMENT] Matricula ${matricula.id} created for cliente ${clienteId} in curso ${cursoId}`,
    );

    return { success: true, matriculaId: matricula.id };
  } catch (error) {
    console.error("[ENROLLMENT] enrollClientInCourse failed:", error);
    return { success: false, error: "Unexpected error during enrollment" };
  }
}

/**
 * Given a Compra ID, enroll the client in all associated courses via the
 * purchased Edicion → Curso chain (DetalleCompra → Producto → Edicion → Curso).
 */
export async function enrollClientFromCompra(
  compraId: string,
): Promise<EnrollResult[]> {
  const compra = await prisma.compra.findUnique({
    where: { id: compraId },
    include: {
      detalles: {
        include: {
          producto: {
            include: {
              edicion: {
                include: { curso: true },
              },
            },
          },
        },
      },
    },
  });

  if (!compra) {
    return [{ success: false, error: `Compra ${compraId} not found` }];
  }

  const results: EnrollResult[] = [];
  for (const detalle of compra.detalles) {
    const cursoId = detalle.producto.edicion.curso_id;
    const result = await enrollClientInCourse(compra.cliente_id, cursoId);
    results.push(result);
  }

  return results;
}
