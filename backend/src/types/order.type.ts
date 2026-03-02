export interface CreateOrderDetailDTO {
  producto_id: string;
  costo_unitario: number;
}

export interface CreateOrderDTO {
  cliente_id: string;
  vendedor_id?: string | null;
  detalles: CreateOrderDetailDTO[];
}

export interface UpdateOrderDTO {
  estado_order?: "pendiente" | "pagado" | "cancelado" | "reembolsado";
  vendedor_id?: string | null;
}