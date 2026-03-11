export interface DashboardPayment {
  id: string;
  estado: string;
  metodoPago: string;
  cantidad: number;
  codigoTransaccion: string | null;
  fechaPago: string | null;
  createdAt: string;
  compraId: string;
  cliente: {
    id: string;
    nombre: string;
    apellido_paterno: string;
    email: string;
    telefono: string | null;
  };
  cursos: { id: string; nombre: string }[];
}

export interface DashboardResponse {
  total: number;
  payments: DashboardPayment[];
}
