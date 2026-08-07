import type { OrderResponse } from "../../types";
import {
  OrderAuditSection,
  OrderCustomerCard,
  OrderDetailHeader,
  OrderFinancialSummary,
  OrderPaymentsHistory,
  OrderProductsCard,
  OrderCommercialContextCard,
} from "./OrderDetailSections";

interface OrderDetailContentProps {
  order: OrderResponse;
  role?: string;
  onBack: () => void;
  onEdit: () => void;
  onRegisterPayment: () => void;
  campaignName?: string | null;
  isCampaignLoading?: boolean;
  isCampaignError?: boolean;
}

export function OrderDetailContent({
  order,
  role,
  onBack,
  onEdit,
  onRegisterPayment,
  campaignName = null,
  isCampaignLoading = false,
  isCampaignError = false,
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
            <OrderCommercialContextCard
              order={order}
              campaignName={campaignName}
              isCampaignLoading={isCampaignLoading}
              isCampaignError={isCampaignError}
            />
          </div>
          <OrderProductsCard order={order} role={role} />
          <OrderPaymentsHistory order={order} />
        </main>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:self-start">
          <OrderFinancialSummary order={order} />
          <OrderAuditSection order={order} />
        </aside>
      </div>
    </div>
  );
}
