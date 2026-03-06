export interface Customer {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string | null;
  dni: string;
  moodle_user_id: number | null;
  credentials_sent: boolean;
  createdAt: string;
}

export interface CustomerFormData {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  telefono: string;
  dni: string;
}
