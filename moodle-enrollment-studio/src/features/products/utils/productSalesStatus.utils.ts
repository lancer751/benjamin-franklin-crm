import { PRODUCT_SALES_STATUS_CONFIG } from "../constants/productSalesStatus.constants";
import type { ProductSalesStatus } from "../types/product.types";

export function getProductSalesStatusConfig(
  status: ProductSalesStatus | null | undefined,
) {
  return PRODUCT_SALES_STATUS_CONFIG[status ?? "DRAFT"];
}
