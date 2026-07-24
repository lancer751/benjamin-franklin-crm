import type {
  OrderListItem,
  OrderResponse,
  OrderStatus,
} from "../types";

export type OrderStatusFilter = "ALL" | OrderStatus;

export interface OrderListMetrics {
  total: number;
  completed: number;
  pending: number;
  totalSold: number;
}

function safeMoney(value: string | number | null | undefined): string {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

function joinName(
  person?: {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
  } | null,
): string {
  return [person?.first_name, person?.middle_name, person?.last_name]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapOrderResponseToListItem(
  order: OrderResponse,
): OrderListItem {
  const leadName = joinName(order.lead) || "Prospecto sin nombre";
  const sellerName = joinName(order.seller?.user);
  const seller = order.seller?.user
    ? {
        fullName: sellerName || "Asesor sin nombre",
        email:
          order.seller.user.corporate_email ??
          order.seller.user.email ??
          null,
        initials: [
          order.seller.user.first_name?.[0],
          order.seller.user.last_name?.[0],
        ]
          .filter(Boolean)
          .join("")
          .toUpperCase(),
      }
    : null;

  return {
    id: order.id,
    orderCode: order.order_code || "Orden sin código",
    status: order.order_status,
    subtotal: safeMoney(order.sub_total),
    totalAmount: safeMoney(order.total_amount),
    discount: safeMoney(order.discount),
    createdAt: order.created_at,
    lead: {
      fullName: leadName,
      email: order.lead.email ?? null,
      dni: order.lead.dni ?? null,
    },
    seller,
    products: order.orderDetails.map((detail) => ({
      name: detail.product.name,
      price: safeMoney(detail.price),
    })),
  };
}

export function normalizeOrderSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function filterOrderListItems(
  orders: OrderListItem[],
  search: string,
  status: OrderStatusFilter,
): OrderListItem[] {
  const query = normalizeOrderSearch(search);

  return orders.filter((order) => {
    if (status !== "ALL" && order.status !== status) return false;
    if (!query) return true;

    const searchable = [
      order.orderCode,
      order.lead.fullName,
      order.lead.email,
      order.lead.dni,
      order.seller?.fullName,
      order.seller?.email,
      ...order.products.map((product) => product.name),
    ]
      .filter((value): value is string => Boolean(value))
      .map(normalizeOrderSearch);

    return searchable.some((value) => value.includes(query));
  });
}

export function calculateOrderListMetrics(
  orders: OrderListItem[],
): OrderListMetrics {
  return orders.reduce<OrderListMetrics>(
    (metrics, order) => {
      metrics.total += 1;
      if (order.status === "COMPLETED") {
        metrics.completed += 1;
        metrics.totalSold += Number(order.totalAmount) || 0;
      }
      if (order.status === "PENDING") metrics.pending += 1;
      return metrics;
    },
    { total: 0, completed: 0, pending: 0, totalSold: 0 },
  );
}
