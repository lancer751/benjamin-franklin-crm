export interface Enrollment {
  id: string;
  customer: string;
  status: "activo" | "retirado" | "completado";
  coursename: string;
  edicion_id: string;
  enrollment_date: string;
}

export interface EnrollmentDetail {
  id: string;
  cliente_id: string;
  edicion_id: string;
  moodle_course_id: number | null;
  cliente: string;
  status: string;
  coursename: string;
  modalidad: string;
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  enrollment_date: string;
}

export interface CreateEnrollmentData {
  cliente_id: string;
  edicion_id: string;
}
