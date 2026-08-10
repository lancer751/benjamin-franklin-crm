import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { invalidatePaymentQueries } from "./usePayments";
import { orderQueryKeys } from "@/features/orders/queryKeys";
import { paymentPlanKeys, paymentsKeys } from "../queryKeys";

describe("invalidatePaymentQueries", () => {
  it("invalida listado, detalle de pago, orden y opciones", () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    invalidatePaymentQueries(queryClient, "payment-1", "order-1", "detail-1");

    expect(invalidate).toHaveBeenCalledWith({ queryKey: paymentsKeys.lists() });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: paymentsKeys.detail("payment-1"),
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: orderQueryKeys.lists() });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: orderQueryKeys.detail("order-1"),
    });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: paymentPlanKeys.detail("order-1", "detail-1"),
    });
  });
});
