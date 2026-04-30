import * as z from "zod";

/**
 * Schema para el formulario de órdenes en el frontend.
 * Los campos monetarios se manejan como números para facilitar cálculos,
 * pero se transformarán a strings antes de enviarlos al backend.
 */
export const orderFormSchema = z.object({
  lead_id: z.string().uuid("Selecciona un cliente válido"),
  order_status: z.enum(["PENDING", "COMPLETED", "REFUNDED", "CANCELLED"]),
  sub_total: z.number().min(0),
  total_amount: z.number().min(0),
  discount: z.number().min(0),
  generated_by: z.string().uuid().optional(),
  order_items: z.array(
    z.object({
      product_id: z.string().uuid("Selecciona un producto válido"),
      price: z.number().min(0, "El precio debe ser mayor a 0"),
      discount_code: z.string().optional().or(z.literal("")),
    })
  ).min(1, "Agrega al menos un producto"),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
