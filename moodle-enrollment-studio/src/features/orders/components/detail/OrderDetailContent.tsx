import type { OrderResponse } from "../../types";
import {
  OrderAuditSection,
  OrderCustomerCard,
  OrderDetailHeader,
  OrderFinancialSummary,
  OrderPaymentPlanCard,
  OrderPaymentsHistory,
  OrderProductsCard,
  OrderSellerCard,
} from "./OrderDetailSections";

interface OrderDetailContentProps {
  order: OrderResponse;
  role?: string;
  onBack: () => void;
  onEdit: () => void;
  onRegisterPayment: () => void;
}

export function OrderDetailContent({
  order,
  role,
  onBack,
  onEdit,
  onRegisterPayment,
}: OrderDetailContentProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <OrderDetailHeader
        order={order}
        role={role}
        onBack={onBack}
        onEdit={onEdit}
        onRegisterPayment={onRegisterPayment}
      />

      <div
        className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"
        data-testid="order-detail-grid"
      >
        <main className="min-w-0 space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <OrderCustomerCard order={order} />
            <OrderSellerCard order={order} />
          </div>
          <OrderProductsCard order={order} />
          <OrderPaymentsHistory order={order} />
          <OrderPaymentPlanCard order={order} />
        </main>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:self-start">
          <OrderFinancialSummary order={order} />
          <OrderAuditSection order={order} />
        </aside>
      </div>
    </div>
  );
}
