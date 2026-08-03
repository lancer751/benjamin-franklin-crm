import { Badge } from "@/core/components/ui/badge";
import type { PaymentStatus } from "../types";
import { paymentStatusLabels } from "../utils/paymentLogic";

const statusClasses: Record<PaymentStatus, string> = {
  CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REFUNDED: "border-amber-200 bg-amber-50 text-amber-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant="outline" className={statusClasses[status]}>
      {paymentStatusLabels[status]}
    </Badge>
  );
}
