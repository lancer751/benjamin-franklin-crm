import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { invalidatePaymentQueries } from "./usePayments";

describe("invalidatePaymentQueries", () => {
  it("invalida listado, detalle de pago, orden y opciones", () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    invalidatePaymentQueries(queryClient, "payment-1", "order-1");

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["payments"] });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["payments", "detail", "payment-1"],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["orders"] });
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["order", "order-1"],
    });
  });
});
