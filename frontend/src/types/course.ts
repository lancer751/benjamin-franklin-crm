export interface Course {
  id: string;
  nombre: string;
  descripcion: string | null;
  status: "activo" | "inactivo";
  duracion_semanas: number;
  createdAt: string;
  updatedAt: string;
  ediciones?: Edition[];
}

export interface Edition {
  id: string;
  curso_id: string;
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  modalidad_id: string;
  moodle_course_id: number | null;
}

export interface CoursesResponse {
  data: Course[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface CourseFormData {
  nombre: string;
  descripcion: string;
  duracion_semanas: number;
}
