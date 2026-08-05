import { z } from "zod";
import type { OrderFormValues, OrderProduct } from "../types";
import { calculateOrderPreview, findProductPrice, orderItemAllowsInstallments } from "../services/orderMappers";
import { ORDER_STATUSES } from "../orderStatus";

const uuidMessage = "Selecciona una opción válida";
const decimalPattern = /^\d+(?:\.\d{1,2})?$/;

const orderItemSchema = z.object({
  product_id: z.string().uuid(uuidMessage),
  attendance_mode: z.enum(["VIRTUAL", "PRESENCIAL", "HEREDADO"]).or(
    z.literal("").refine(() => false, "Selecciona una modalidad"),
  ),
  payment_modality: z.enum(["FULL", "INSTALLMENTS"]).or(
    z.literal("").refine(() => false, "Selecciona una modalidad de pago"),
  ),
  discount_code: z
    .string()
    .nullable()
    .refine(
      (value) => !value || value.length === 7,
      "El código debe tener exactamente 7 caracteres.",
    ),
});

export function buildOrderFormSchema(
  products: OrderProduct[],
  options: { requireLead: boolean; requireItems: boolean },
) {
  return z
    .object({
      leadId: options.requireLead
        ? z.string().uuid("Selecciona un prospecto")
        : z.string(),
      assigned_to: z.string(),
      discount: z
        .string()
        .trim()
        .refine(
          (value) => value === "" || decimalPattern.test(value),
          "Ingresa un monto válido con hasta dos decimales",
        )
        .refine(
          (value) => value === "" || Number(value) >= 0,
          "El descuento no puede ser negativo",
        ),
      order_items: options.requireItems
        ? z.array(orderItemSchema).min(1, "Agrega al menos un producto")
        : z.array(orderItemSchema),
      order_status: z.enum(ORDER_STATUSES).optional(),
    })
    .superRefine((values, context) => {
      const seen = new Set<string>();

      values.order_items.forEach((item, index) => {
        if (!item.product_id || !item.attendance_mode) return;
        const key = `${item.product_id}:${item.attendance_mode}`;
        if (seen.has(key)) {
          context.addIssue({
            code: "custom",
            path: ["order_items", index, "attendance_mode"],
            message: "Este producto y modalidad ya fueron agregados",
          });
        }
        seen.add(key);

        if (!findProductPrice(products, item.product_id, item.attendance_mode)) {
          context.addIssue({
            code: "custom",
            path: ["order_items", index, "attendance_mode"],
            message: "No existe un precio para esta modalidad",
          });
        }
        const product = products.find((candidate) => candidate.id === item.product_id);
        const price = findProductPrice(products, item.product_id, item.attendance_mode);
        if (item.payment_modality === "INSTALLMENTS" && !orderItemAllowsInstallments(product, price)) {
          context.addIssue({
            code: "custom",
            path: ["order_items", index, "payment_modality"],
            message: "Este producto solo permite pagos al contado",
          });
        }
      });

      if (options.requireItems) {
        const { subtotal } = calculateOrderPreview(
          values as OrderFormValues,
          products,
        );
        const discount = values.discount === "" ? 0 : Number(values.discount);
        if (Number.isFinite(discount) && discount > subtotal) {
          context.addIssue({
            code: "custom",
            path: ["discount"],
            message: "El descuento no puede superar el subtotal",
          });
        }
      }
    });
}

export const emptyOrderFormValues: OrderFormValues = {
  leadId: "",
  assigned_to: "",
  discount: "",
  order_items: [
    {
      product_id: "",
      attendance_mode: "",
      payment_modality: "FULL",
      discount_code: null,
    },
  ],
};
