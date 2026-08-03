import { Badge } from "@/core/components/ui/badge";
import type { ProductSalesStatus } from "../../types/product.types";
import { getProductSalesStatusConfig } from "../../utils/productSalesStatus.utils";

interface ProductStatusBadgeProps {
  status: ProductSalesStatus | null | undefined;
}

const ProductStatusBadge = ({ status }: ProductStatusBadgeProps) => {
  const statusConfig = getProductSalesStatusConfig(status);

  return (
    <Badge
      variant={statusConfig.badgeVariant}
      className={statusConfig.badgeClassName}
    >
      {statusConfig.label}
    </Badge>
  );
};

export default ProductStatusBadge;
