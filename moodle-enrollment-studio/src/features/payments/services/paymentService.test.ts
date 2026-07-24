import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  getById: vi.fn(),
  put: vi.fn(),
  patchStatus: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/core/lib/api", () => ({
  api: {
    payments: {
      $get: apiMocks.get,
      $post: apiMocks.post,
      ":id": {
        $get: apiMocks.getById,
        $put: apiMocks.put,
        $delete: apiMocks.remove,
        status: { $patch: apiMocks.patchStatus },
      },
    },
  },
}));

import {
  getPayments,
  mapPaymentApiError,
  PaymentApiError,
  updatePayment,
  updatePaymentStatus,
} from "./paymentService";

function successResponse(data: unknown) {
  return new Response(
    JSON.stringify({ success: true, message: "ok", data }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("paymentService", () => {
  beforeEach(() => {
    Object.values(apiMocks).forEach((mock) => mock.mockReset());
  });

  it("consulta GET /api/payments mediante el cliente global", async () => {
    apiMocks.get.mockResolvedValue(successResponse([]));
    await expect(getPayments()).resolves.toMatchObject({ data: [] });
    expect(apiMocks.get).toHaveBeenCalledTimes(1);
  });

  it("PUT solo transmite los campos de referencia permitidos", async () => {
    apiMocks.put.mockResolvedValue(successResponse({ id: "payment-1" }));
    await updatePayment("payment-1", { transaccion_id: "NEW" });
    expect(apiMocks.put).toHaveBeenCalledWith({
      param: { id: "payment-1" },
      json: { transaccion_id: "NEW" },
    });
  });

  it("PATCH usa el endpoint dedicado de estado", async () => {
    apiMocks.patchStatus.mockResolvedValue(
      successResponse({ id: "payment-1" }),
    );
    await updatePaymentStatus("payment-1", {
      payment_status: "REFUNDED",
    });
    expect(apiMocks.patchStatus).toHaveBeenCalledWith({
      param: { id: "payment-1" },
      json: { payment_status: "REFUNDED" },
    });
  });

  it("traduce errores reales del backend", () => {
    expect(
      mapPaymentApiError(
        new PaymentApiError(
          400,
          "Payment would exceed the order's total amount",
        ),
      ),
    ).toBe("El pago confirmado supera el saldo pendiente de la orden.");
    expect(
      mapPaymentApiError(
        new PaymentApiError(
          400,
          "Cannot delete confirmed payments. Create a refund instead.",
        ),
      ),
    ).toBe(
      "Los pagos confirmados no pueden eliminarse. Debes registrar un reembolso.",
    );
  });
});
