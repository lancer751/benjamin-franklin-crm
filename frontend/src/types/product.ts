export interface Product {
  id: string;
  precio: number;
  coursename: string;
  edicion_id: string;
  duracion_semanas: number;
  modalidad: string;
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  precio: number;
  curso_id: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  modalidad_id: string;
  moddle_course_id?: string;
}
