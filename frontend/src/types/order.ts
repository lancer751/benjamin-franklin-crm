export interface OrderListItem {
  id: string;
  costo_total: number;
  estado_order: "pendiente" | "pagado" | "cancelado" | "reembolsado";
  cliente: { id: string; fullname: string };
  vendedor: { id: string; fullname: string } | null;
  created_at: string;
}

export interface OrderDetail {
  id: string;
  estado_order: string;
  costo_total: number;
  cliente: { id: string; fullname: string };
  vendedor: { id: string; fullname: string } | null;
  order_detail: {
    producto_id: string;
    precio: number;
    course_name: string;
    edicion_id: string;
    modalidad: string;
  }[];
  pagos: {
    id: string;
    cantidad: number;
    estado: string;
    fecha_pago: string | null;
    metodo_pago: string;
  }[];
}

export interface CreateOrderData {
  cliente_id: string;
  vendedor_id?: string | null;
  detalles: { producto_id: string; costo_unitario: number }[];
}
