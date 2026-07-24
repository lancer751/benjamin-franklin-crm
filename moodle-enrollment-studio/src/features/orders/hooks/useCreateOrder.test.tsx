import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateOrderPayload, OrderResponse } from "../types";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  createOrder: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../services/orderService", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../services/orderService")>();
  return { ...actual, createOrder: mocks.createOrder };
});

import { useCreateOrder } from "./useCreateOrder";

const payload: CreateOrderPayload = {
  lead_id: "22222222-2222-4222-8222-222222222222",
  order_items: [
    {
      product_id: "11111111-1111-4111-8111-111111111111",
      attendance_mode: "VIRTUAL",
      discount_code: null,
    },
  ],
};

const order = {
  id: "33333333-3333-4333-8333-333333333333",
  lead_id: payload.lead_id,
  sub_total: "100.00",
  total_amount: "100.00",
  discount: "0.00",
  order_status: "PENDING",
  order_code: "ABC1234",
  created_at: "2026-07-23T00:00:00.000Z",
  updated_at: "2026-07-23T00:00:00.000Z",
  lead: {
    id: payload.lead_id,
    first_name: "Ana",
    last_name: "Pérez",
    email: "ana@example.com",
  },
  orderDetails: [],
} satisfies OrderResponse;

describe("useCreateOrder", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.createOrder.mockReset();
    mocks.createOrder.mockResolvedValue({
      success: true,
      message: "created",
      data: order,
    });
  });

  it("redirige al detalle después de crear", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreateOrder(), { wrapper });

    act(() => result.current.mutate(payload));

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith(`/ordenes/${order.id}`),
    );
    expect(mocks.createOrder).toHaveBeenCalledTimes(1);
  });
});
