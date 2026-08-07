import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), uploadUrl: vi.fn(), receipt: vi.fn() }));
vi.mock("@/core/lib/api", () => ({
  api: { payments: {
    $get: mocks.get,
    "evidence-upload-url": { $post: mocks.uploadUrl },
    ":id": { $get: vi.fn(), $delete: vi.fn(), status: { $patch: mocks.patch }, "receipt-url": { $get: mocks.receipt } },
  } },
}));

import { getPayments, mapPaymentApiError, PaymentApiError, requestEvidenceUpload, updatePaymentStatus } from "./paymentService";

const response = (data: unknown) => new Response(JSON.stringify({ success: true, message: "ok", data }), { status: 200, headers: { "Content-Type": "application/json" } });

describe("paymentService", () => {
  beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockReset()));

  it("envía filtros soportados al listado", async () => {
    mocks.get.mockResolvedValue(response({ payments: [], total: 0, page: 1, limit: 100 }));
    await getPayments({ payment_status: "PENDING" });
    expect(mocks.get).toHaveBeenCalledWith({ query: { page: "1", limit: "100", payment_status: "PENDING" } });
  });

  it("la revisión solo envía CONFIRMED o FAILED", async () => {
    mocks.patch.mockResolvedValue(response({ id: "payment-1" }));
    await updatePaymentStatus("payment-1", { payment_status: "FAILED" });
    expect(mocks.patch).toHaveBeenCalledWith({ param: { id: "payment-1" }, json: { payment_status: "FAILED" } });
  });

  it("solicita la key de evidencia sin convertir el archivo a base64", async () => {
    mocks.uploadUrl.mockResolvedValue(response({ url: "https://bucket", fields: {}, key: "payment-evidence/key.pdf" }));
    await expect(requestEvidenceUpload({ file_name: "receipt.pdf", content_type: "application/pdf" })).resolves.toMatchObject({ key: "payment-evidence/key.pdf" });
  });

  it("traduce el conflicto de cuota duplicada", () => {
    expect(mapPaymentApiError(new PaymentApiError(409, "Esta cuota ya tiene un pago registrado"))).toBe("Esta cuota ya tiene un pago pendiente de validación.");
  });
});
