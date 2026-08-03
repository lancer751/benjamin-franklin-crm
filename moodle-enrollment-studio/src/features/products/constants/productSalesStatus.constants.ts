import type { ProductSalesStatus } from "../types/product.types";

type ProductSalesStatusConfig = {
  value: ProductSalesStatus;
  label: string;
  badgeVariant: "secondary" | "outline" | "destructive";
  badgeClassName?: string;
};

export const PRODUCT_SALES_STATUS_CONFIG = {
  DRAFT: {
    value: "DRAFT",
    label: "Borrador",
    badgeVariant: "secondary",
  },
  PUBLISHED: {
    value: "PUBLISHED",
    label: "Publicado",
    badgeVariant: "outline",
    badgeClassName: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ON_SALE: {
    value: "ON_SALE",
    label: "En venta",
    badgeVariant: "outline",
    badgeClassName: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  COMPLETED: {
    value: "COMPLETED",
    label: "Completado",
    badgeVariant: "outline",
    badgeClassName: "bg-purple-100 text-purple-800 border-purple-200",
  },
  CANCELLED: {
    value: "CANCELLED",
    label: "Cancelado",
    badgeVariant: "destructive",
  },
} as const satisfies Record<ProductSalesStatus, ProductSalesStatusConfig>;

export const PRODUCT_SALES_STATUS_OPTIONS = Object.values(
  PRODUCT_SALES_STATUS_CONFIG,
);
