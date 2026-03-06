export interface Payment {
  id: string;
  orden_id: string;
  cantidad: number;
  estado: "pendiente" | "confirmado" | "rechazado" | "reembolsado";
  codigo_transaccion: string | null;
  fecha_pago: string | null;
  metodo_pago: "efectivo" | "transferencia" | "pos" | "online" | "yape";
  createdAt: string;
  updatedAt: string;
}

export interface ManualPaymentData {
  order_id: string;
  amount: number;
  method: "efectivo" | "transferencia" | "pos" | "online" | "yape";
  paymentStatus: "confirmado" | "rechazado" | "pendiente";
}
