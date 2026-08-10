import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { PaymentListItem } from "../types";

const usePaymentsViewMock = vi.hoisted(() => vi.fn());
vi.mock("../hooks/usePayments", () => ({
  paymentStatuses: ["PENDING", "CONFIRMED", "FAILED", "REFUNDED"],
  usePaymentsView: usePaymentsViewMock,
}));
vi.mock("../components/PaymentStatusDialog", () => ({ PaymentStatusDialog: () => null }));
import PaymentsView from "./PaymentsView";

const payment: PaymentListItem = {
  id: "payment-1", transactionId: "YAPE-123", orderId: "order-1", orderCode: "REFTGEL",
  orderDetailId: "detail-1", scheduledPaymentId: "installment-1", clientName: "Rodrigo Gaitán",
  productName: "Lectura de planos", installmentLabel: "Cuota 1", method: "YAPE", status: "PENDING",
  type: "INSTALLMENTS", amount: "220.00", currency: "PEN", paymentDate: "2026-07-24T15:30:00.000Z",
  createdAt: "2026-07-24T15:31:00.000Z", registeredBy: "Ana Romero", reviewedBy: null,
};

function controller() {
  return { payments: [payment], filteredPayments: [payment], permissions: { canReview: true }, search: "", status: "ALL", isLoading: false, isError: false, setSearch: vi.fn(), setStatus: vi.fn(), retry: vi.fn(), navigateToDetail: vi.fn() };
}

describe("PaymentsView", () => {
  it("muestra información operativa sin IDs crudos", () => {
    usePaymentsViewMock.mockReturnValue(controller());
    render(<MemoryRouter><PaymentsView /></MemoryRouter>);
    expect(screen.getByText("Rodrigo Gaitán")).toBeInTheDocument();
    expect(screen.getByText("Lectura de planos")).toBeInTheDocument();
    expect(screen.getByText("Ana Romero")).toBeInTheDocument();
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThan(0);
  });

  it("conecta búsqueda y filtro de estado", () => {
    const state = controller();
    usePaymentsViewMock.mockReturnValue(state);
    render(<MemoryRouter><PaymentsView /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText("Prospecto, orden, producto o usuario"), { target: { value: "Rodrigo" } });
    fireEvent.change(screen.getByDisplayValue("Todos los estados"), { target: { value: "PENDING" } });
    expect(state.setSearch).toHaveBeenCalledWith("Rodrigo");
    expect(state.setStatus).toHaveBeenCalledWith("PENDING");
  });
});
