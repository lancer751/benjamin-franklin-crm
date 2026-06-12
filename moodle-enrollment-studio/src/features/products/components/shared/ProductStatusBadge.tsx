import { Badge } from "@/core/components/ui/badge";
import { ProductSalesStatusMap } from "@/core/utils/dictionaries";

interface ProductStatusBadgeProps {
  status: string;
}

const ProductStatusBadge = ({ status }: ProductStatusBadgeProps) => {
  const label = ProductSalesStatusMap[status] || status || "Desconocido";

  switch (status) {
    case "ON_SALE":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
          {label}
        </Badge>
      );
    case "DRAFT":
      return <Badge variant="secondary">{label}</Badge>;
    case "PUBLISHED":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          {label}
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          {label}
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive">{label}</Badge>;
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
};

export default ProductStatusBadge;
