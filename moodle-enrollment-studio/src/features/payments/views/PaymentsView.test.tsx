import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PaymentListItem } from "../types";

const usePaymentsViewMock = vi.hoisted(() => vi.fn());
const deleteMutateMock = vi.hoisted(() => vi.fn());

vi.mock("../hooks/usePayments", () => ({
  paymentMethods: ["YAPE", "ONLINE", "POS", "CASH", "BANK_TRANSFER"],
  paymentTypes: ["FULL", "INSTALLMENTS"],
  usePaymentsView: usePaymentsViewMock,
  useDeletePayment: () => ({ mutate: deleteMutateMock, isPending: false }),
}));

vi.mock("../components/PaymentEditDialog", () => ({
  PaymentEditDialog: () => null,
}));
vi.mock("../components/PaymentStatusDialog", () => ({
  PaymentStatusDialog: () => null,
}));

import PaymentsView from "./PaymentsView";

const payment: PaymentListItem = {
  id: "payment-1",
  transactionId: "YAPE-123",
  orderId: "order-1",
  orderCode: "REFTGEL",
  orderTotal: "440.00",
  client: {
    fullName: "Rodrigo Gaitán",
    email: "rodrigo@example.com",
    dni: null,
  },
  method: "YAPE",
  status: "CONFIRMED",
  type: "FULL",
  amount: "440.00",
  currency: "PEN",
  paymentDate: "2026-07-24T15:30:00.000Z",
  createdAt: "2026-07-24T15:31:00.000Z",
};

function controller() {
  return {
    payments: [payment],
    filteredPayments: [payment],
    metrics: { total: 1, confirmed: 1, failed: 0, confirmedAmount: 440 },
    permissions: {
      canAccess: true,
      canCreate: true,
      canEdit: true,
      canChangeStatus: false,
      canDelete: false,
    },
    search: "",
    status: "ALL",
    method: "ALL",
    type: "ALL",
    isLoading: false,
    isError: false,
    setSearch: vi.fn(),
    setStatus: vi.fn(),
    setMethod: vi.fn(),
    setType: vi.fn(),
    retry: vi.fn(),
    clearFilters: vi.fn(),
    navigateToCreate: vi.fn(),
    navigateToDetail: vi.fn(),
  };
}

describe("PaymentsView", () => {
  beforeEach(() => {
    usePaymentsViewMock.mockReset();
  });

  it("renderiza CustomTable, columnas, métricas y datos reales", () => {
    usePaymentsViewMock.mockReturnValue(controller());
    render(
      <MemoryRouter>
        <PaymentsView />
      </MemoryRouter>,
    );

    expect(screen.getByText("YAPE-123")).toBeInTheDocument();
    expect(screen.getByText("REFTGEL")).toBeInTheDocument();
    expect(screen.getByText("Rodrigo Gaitán")).toBeInTheDocument();
    expect(screen.getAllByText("Confirmado").length).toBeGreaterThan(0);
    expect(screen.getByText("Monto confirmado")).toBeInTheDocument();
    expect(screen.getAllByText(/S\/\s*440\.00/).length).toBeGreaterThan(0);
    expect(screen.getByRole("columnheader", { name: /Pago/ })).toBeInTheDocument();
  });

  it("conecta búsqueda y los tres filtros", () => {
    const state = controller();
    usePaymentsViewMock.mockReturnValue(state);
    render(
      <MemoryRouter>
        <PaymentsView />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Buscar pagos"), {
      target: { value: "YAPE" },
    });
    fireEvent.change(screen.getByLabelText("Filtrar por estado"), {
      target: { value: "CONFIRMED" },
    });
    fireEvent.change(screen.getByLabelText("Filtrar por método"), {
      target: { value: "YAPE" },
    });
    fireEvent.change(screen.getByLabelText("Filtrar por tipo"), {
      target: { value: "FULL" },
    });

    expect(state.setSearch).toHaveBeenCalledWith("YAPE");
    expect(state.setStatus).toHaveBeenCalledWith("CONFIRMED");
    expect(state.setMethod).toHaveBeenCalledWith("YAPE");
    expect(state.setType).toHaveBeenCalledWith("FULL");
  });

  it("navega al detalle por fila y muestra CTA según permisos", () => {
    const state = controller();
    usePaymentsViewMock.mockReturnValue(state);
    render(
      <MemoryRouter>
        <PaymentsView />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText("YAPE-123"));
    expect(state.navigateToDetail).toHaveBeenCalledWith(payment);
    fireEvent.click(screen.getByRole("button", { name: "Registrar pago" }));
    expect(state.navigateToCreate).toHaveBeenCalled();
  });

  it("renderiza loading, error y vacío", () => {
    usePaymentsViewMock.mockReturnValue({ ...controller(), isLoading: true });
    const { rerender } = render(
      <MemoryRouter>
        <PaymentsView />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Cargando pagos")).toBeInTheDocument();

    const errorState = { ...controller(), isError: true };
    usePaymentsViewMock.mockReturnValue(errorState);
    rerender(
      <MemoryRouter>
        <PaymentsView />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(errorState.retry).toHaveBeenCalled();

    usePaymentsViewMock.mockReturnValue({
      ...controller(),
      payments: [],
      filteredPayments: [],
    });
    rerender(
      <MemoryRouter>
        <PaymentsView />
      </MemoryRouter>,
    );
    expect(screen.getByText("No hay pagos registrados.")).toBeInTheDocument();
  });
});
