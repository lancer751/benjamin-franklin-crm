import type {
  AttendanceMode,
  CreateOrderItemPayload,
  CreateOrderPayload,
  MappedOrderForm,
  OrderFormItem,
  OrderFormValues,
  OrderProduct,
  OrderResponse,
  UpdateOrderPayload,
} from "../types";

const attendanceModes: AttendanceMode[] = ["VIRTUAL", "PRESENCIAL", "HEREDADO"];

function isAttendanceMode(value: unknown): value is AttendanceMode {
  return attendanceModes.includes(value as AttendanceMode);
}

function normalizeMoney(value: string): string | undefined {
  if (value.trim() === "") return undefined;
  return Number(value).toFixed(2);
}

export function normalizeOrderItem(item: OrderFormItem): CreateOrderItemPayload {
  if (!isAttendanceMode(item.attendance_mode)) {
    throw new Error("La modalidad del producto es obligatoria.");
  }
  return {
    product_id: item.product_id,
    attendance_mode: item.attendance_mode,
    discount_code: item.discount_code?.trim() || null,
  };
}

export function mapCreateFormToPayload(values: OrderFormValues): CreateOrderPayload {
  const discount = normalizeMoney(values.discount);
  return {
    lead_id: values.lead_id,
    ...(discount !== undefined && { discount }),
    order_items: values.order_items.map(normalizeOrderItem),
  };
}

export function mapOrderToFormValues(order: OrderResponse): MappedOrderForm {
  const canEditItems =
    order.orderDetails.length > 0 &&
    order.orderDetails.every((detail) => isAttendanceMode(detail.attendance_mode));

  const orderItems: OrderFormItem[] = canEditItems
    ? order.orderDetails.map((detail) => ({
        product_id: detail.product_id,
        attendance_mode: detail.attendance_mode as AttendanceMode,
        discount_code: detail.discount_code,
      }))
    : [];

  return {
    values: {
      lead_id: order.lead_id,
      discount: Number(order.discount || 0).toFixed(2),
      order_items: orderItems,
      order_status: order.order_status,
    },
    canEditItems,
    ...(!canEditItems && {
      limitation:
        "La API de la orden no devuelve la modalidad de asistencia de sus productos. Para evitar modificar precios con una modalidad inferida, los productos y el descuento se muestran en solo lectura.",
    }),
  };
}

function comparableItems(items: OrderFormItem[]): string {
  return JSON.stringify(
    items.map((item) => ({
      product_id: item.product_id,
      attendance_mode: item.attendance_mode,
      discount_code: item.discount_code?.trim() || null,
    })),
  );
}

export function mapUpdateFormToPayload(
  values: OrderFormValues,
  initialValues: OrderFormValues,
): UpdateOrderPayload {
  const payload: UpdateOrderPayload = {};
  const itemsChanged =
    comparableItems(values.order_items) !== comparableItems(initialValues.order_items);
  const discountChanged =
    normalizeMoney(values.discount) !== normalizeMoney(initialValues.discount);
  const statusChanged = values.order_status !== initialValues.order_status;

  if (itemsChanged || discountChanged) {
    // Backend recalculates and persists discount only when it also receives
    // order_items, so a discount edit must include the complete current array.
    payload.order_items = values.order_items.map(normalizeOrderItem);
    payload.discount = normalizeMoney(values.discount) ?? "0.00";
  }

  if (statusChanged && values.order_status) {
    payload.order_status = values.order_status;
  }

  return payload;
}

export function findProductPrice(
  products: OrderProduct[],
  productId: string,
  attendanceMode: AttendanceMode | "",
) {
  return products
    .find((product) => product.id === productId)
    ?.prices.find((price) => price.attendance_mode === attendanceMode);
}

export function getAvailableAttendanceModes(
  products: OrderProduct[],
  productId: string,
): AttendanceMode[] {
  return (
    products
      .find((product) => product.id === productId)
      ?.prices.map((price) => price.attendance_mode) ?? []
  );
}

export function calculateOrderPreview(
  values: Pick<OrderFormValues, "order_items" | "discount">,
  products: OrderProduct[],
) {
  const subtotal = values.order_items.reduce((sum, item) => {
    const price = findProductPrice(
      products,
      item.product_id,
      item.attendance_mode,
    );
    return sum + Number(price?.cash_price ?? 0);
  }, 0);
  const discount = Math.max(0, Number(values.discount || 0) || 0);
  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
  };
}
