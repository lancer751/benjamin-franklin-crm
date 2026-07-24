import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OrdersViewController } from "../hooks/useOrdersView";
import type { OrderListItem } from "../types";

const useOrdersViewMock = vi.hoisted(() => vi.fn());

vi.mock("../hooks/useOrdersView", () => ({
  useOrdersView: useOrdersViewMock,
}));

import OrdersView from "./OrdersView";

const order: OrderListItem = {
  id: "54566a99-2980-4147-9f75-a61906cf8344",
  orderCode: "REFTGEL",
  status: "PENDING",
  subtotal: "460.00",
  totalAmount: "440.00",
  discount: "20.00",
  createdAt: "2026-07-24T02:09:05.552Z",
  lead: {
    fullName: "Rodrigo Gaitán Arenas",
    email: "rodrigo@example.com",
    dni: null,
  },
  seller: {
    fullName: "Miguel Torres",
    email: "mtorres@bf.edu.pe",
    initials: "MT",
  },
  products: [
    { name: "Curso de Lectura de Planos", price: "440.00" },
    { name: "Gestión de proyectos", price: "200.00" },
  ],
};

function makeController(
  overrides: Partial<OrdersViewController> = {},
): OrdersViewController {
  return {
    orders: [order],
    filteredOrders: [order],
    metrics: { total: 1, completed: 0, pending: 1, totalSold: 0 },
    permissions: {
      canCreate: true,
      canEdit: true,
      canCancel: true,
      canDelete: true,
      canRegisterPayment: true,
    },
    search: "",
    statusFilter: "ALL",
    pendingAction: null,
    isLoading: false,
    isError: false,
    isMutating: false,
    setSearch: vi.fn(),
    setStatusFilter: vi.fn(),
    setPendingAction: vi.fn(),
    retry: vi.fn(),
    navigateToNew: vi.fn(),
    navigateToDetail: vi.fn(),
    navigateToEdit: vi.fn(),
    navigateToPayment: vi.fn(),
    confirmPendingAction: vi.fn(),
    ...overrides,
  };
}

describe("OrdersView", () => {
  beforeEach(() => {
    useOrdersViewMock.mockReset();
  });

  it("renderiza los datos usando CustomTable y columnas TanStack ordenables", () => {
    useOrdersViewMock.mockReturnValue(makeController());
    render(<OrdersView />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("REFTGEL")).toBeInTheDocument();
    expect(screen.getByText("Rodrigo Gaitán Arenas")).toBeInTheDocument();
    expect(screen.getByText("Curso de Lectura de Planos")).toBeInTheDocument();
    expect(screen.getByText("Miguel Torres")).toBeInTheDocument();
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /Orden/ }),
    ).toBeInTheDocument();
  });

  it("navega al detalle al hacer click en una fila", () => {
    const controller = makeController();
    useOrdersViewMock.mockReturnValue(controller);
    render(<OrdersView />);

    fireEvent.click(screen.getByText("REFTGEL").closest("tr") as HTMLElement);

    expect(controller.navigateToDetail).toHaveBeenCalledWith(order);
  });

  it("conecta búsqueda y filtro de estado con el hook", () => {
    const controller = makeController();
    useOrdersViewMock.mockReturnValue(controller);
    render(<OrdersView />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "rodrigo" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "COMPLETED" },
    });

    expect(controller.setSearch).toHaveBeenCalledWith("rodrigo");
    expect(controller.setStatusFilter).toHaveBeenCalledWith("COMPLETED");
  });

  it("muestra Total vendido y no inventa ingresos confirmados", () => {
    useOrdersViewMock.mockReturnValue(
      makeController({
        metrics: { total: 2, completed: 1, pending: 1, totalSold: 440 },
      }),
    );
    render(<OrdersView />);

    expect(screen.getByText("Total vendido")).toBeInTheDocument();
    expect(screen.getByText("Solo órdenes completadas")).toBeInTheDocument();
    expect(screen.queryByText(/Ingresos confirmados/i)).not.toBeInTheDocument();
  });

  it("renderiza seller null y múltiples productos sin modalidad", () => {
    const systemOrder = { ...order, seller: null };
    useOrdersViewMock.mockReturnValue(
      makeController({
        orders: [systemOrder],
        filteredOrders: [systemOrder],
      }),
    );
    render(<OrdersView />);

    expect(screen.getByText("Generada por el sistema")).toBeInTheDocument();
    expect(screen.getByText("+1 producto adicional")).toBeInTheDocument();
    expect(screen.queryByText(/modalidad/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/password|role_id/i)).not.toBeInTheDocument();
  });

  it("el menú de acciones detiene la navegación de la fila", async () => {
    const controller = makeController();
    useOrdersViewMock.mockReturnValue(controller);
    render(<OrdersView />);

    fireEvent.keyDown(
      screen.getByRole("button", {
        name: "Acciones de la orden REFTGEL",
      }),
      { key: "Enter" },
    );

    expect(controller.navigateToDetail).not.toHaveBeenCalled();
    fireEvent.click(await screen.findByText("Ver detalle"));
    expect(controller.navigateToDetail).toHaveBeenCalledTimes(1);
    expect(controller.navigateToDetail).toHaveBeenCalledWith(order);
  });

  it("renderiza loading y error con reintento", () => {
    useOrdersViewMock.mockReturnValue(
      makeController({ isLoading: true, orders: [], filteredOrders: [] }),
    );
    const { rerender } = render(<OrdersView />);
    expect(screen.getByLabelText("Cargando órdenes")).toBeInTheDocument();

    const retry = vi.fn();
    useOrdersViewMock.mockReturnValue(
      makeController({
        isError: true,
        orders: [],
        filteredOrders: [],
        retry,
      }),
    );
    rerender(<OrdersView />);
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(retry).toHaveBeenCalled();
  });

  it("renderiza vacío y CTA según permisos", () => {
    const navigateToNew = vi.fn();
    useOrdersViewMock.mockReturnValue(
      makeController({
        orders: [],
        filteredOrders: [],
        navigateToNew,
      }),
    );
    const { rerender } = render(<OrdersView />);

    expect(screen.getByText("No hay órdenes registradas.")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Nueva orden" })[1]);
    expect(navigateToNew).toHaveBeenCalled();

    useOrdersViewMock.mockReturnValue(
      makeController({
        orders: [],
        filteredOrders: [],
        permissions: {
          canCreate: false,
          canEdit: false,
          canCancel: false,
          canDelete: false,
          canRegisterPayment: false,
        },
      }),
    );
    rerender(<OrdersView />);
    expect(
      screen.queryByRole("button", { name: "Nueva orden" }),
    ).not.toBeInTheDocument();
  });

  it("muestra el estado sin coincidencias y conserva layout móvil sin overflow", () => {
    useOrdersViewMock.mockReturnValue(
      makeController({
        filteredOrders: [],
        search: "inexistente",
      }),
    );
    render(<OrdersView />);

    expect(
      screen.getByText(
        "No se encontraron órdenes con los filtros aplicados.",
      ),
    ).toBeInTheDocument();
    const listSection = screen.getByText("Listado de órdenes").closest("section");
    expect(listSection).toHaveClass("overflow-hidden");
  });
});
