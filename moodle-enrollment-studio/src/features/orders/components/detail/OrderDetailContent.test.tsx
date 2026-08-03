import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OrderResponse } from "../../types";
import { OrderDetailContent } from "./OrderDetailContent";

const baseOrder: OrderResponse = {
  id: "54566a99-2980-4147-9f75-a61906cf8344",
  lead_id: "543fd75a-e25c-4eb3-96f0-1841d56a0fe7",
  generated_by: "fc31c497-79e5-4cc5-8200-c0083e914eb0",
  sub_total: "440",
  total_amount: "440",
  discount: "0",
  order_status: "PENDING",
  order_code: "REFTGEL",
  created_at: "2026-07-24T02:09:05.552Z",
  updated_at: "2026-07-24T02:09:05.552Z",
  lead: {
    id: "543fd75a-e25c-4eb3-96f0-1841d56a0fe7",
    first_name: "Rodrigo",
    middle_name: "",
    last_name: "Gaitán Arenas",
    email: "rodrigo@example.com",
    profession: "Estratega",
    dni: null,
    gender: null,
    address: null,
    lead_status: "ACTIVE",
    created_at: "2026-07-01T10:00:00.000Z",
  },
  seller: {
    id: "d191c618-33d0-44f7-8eaa-7f353bd3b6eb",
    sales_target: 11,
    total_orders: 8,
    completed_orders: 5,
    canceled_orders: 1,
    user: {
      first_name: "Miguel",
      middle_name: "",
      last_name: "Torres",
      email: "miguel@example.com",
      corporate_email: "mtorres@bf.edu.pe",
      is_active: true,
    },
  },
  orderDetails: [
    {
      id: "29ea97bd-27e8-43f6-8ba1-93fec8428990",
      product_id: "665d5b12-e051-47a0-ba6f-315cc6ad7a8e",
      price: "440",
      discount_code: null,
      product: {
        id: "665d5b12-e051-47a0-ba6f-315cc6ad7a8e",
        name: "Curso de Lectura de Planos",
        short_description: "Interpretación profesional de planos.",
        image_url: null,
        brochure_url: null,
        sales_status: "PUBLISHED",
        pricing_status: "VALID",
        installments_min_number: 2,
        installments_max_number: 4,
      },
    },
  ],
  paymentPlans: [],
  payments: [],
};

function renderDetail(
  order: OrderResponse = baseOrder,
  role = "ADMIN",
) {
  const props = {
    onBack: vi.fn(),
    onEdit: vi.fn(),
    onRegisterPayment: vi.fn(),
  };
  render(<OrderDetailContent order={order} role={role} {...props} />);
  return props;
}

describe("OrderDetailContent", () => {
  it("renderiza el código, traduce PENDING y muestra acciones permitidas", () => {
    renderDetail();

    expect(screen.getByText("Orden REFTGEL")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getAllByText("Editar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Registrar pago").length).toBeGreaterThan(0);
  });

  it("renderiza el prospecto sin inventar teléfono ni opcionales nulos", () => {
    renderDetail();

    expect(screen.getByText("Rodrigo Gaitán Arenas")).toBeInTheDocument();
    expect(screen.getByText("rodrigo@example.com")).toBeInTheDocument();
    expect(screen.queryByText(/teléfono/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Género")).not.toBeInTheDocument();
    expect(screen.queryByText("Dirección")).not.toBeInTheDocument();
    expect(screen.queryByText("DNI")).not.toBeInTheDocument();
  });

  it("renderiza el asesor sin exponer campos sensibles", () => {
    renderDetail();

    expect(screen.getByText("Miguel Torres")).toBeInTheDocument();
    expect(screen.getByText("mtorres@bf.edu.pe")).toBeInTheDocument();
    expect(screen.queryByText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/role_id/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Venta asistida")).not.toBeInTheDocument();
  });

  it("muestra orden generada por el sistema cuando seller es null", () => {
    renderDetail({ ...baseOrder, seller: null });
    expect(
      screen.getByText("Orden generada por el sistema"),
    ).toBeInTheDocument();
  });

  it("renderiza múltiples productos sin inventar modalidad, categoría o edición", () => {
    const secondProduct = {
      ...baseOrder.orderDetails[0],
      id: "39ea97bd-27e8-43f6-8ba1-93fec8428990",
      product_id: "765d5b12-e051-47a0-ba6f-315cc6ad7a8e",
      product: {
        ...baseOrder.orderDetails[0].product,
        id: "765d5b12-e051-47a0-ba6f-315cc6ad7a8e",
        name: "Gestión de proyectos",
      },
    };
    renderDetail({
      ...baseOrder,
      orderDetails: [...baseOrder.orderDetails, secondProduct],
    });

    expect(screen.getByText("Curso de Lectura de Planos")).toBeInTheDocument();
    expect(screen.getByText("Gestión de proyectos")).toBeInTheDocument();
    expect(screen.queryByText(/modalidad/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/categoría/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/edición/i)).not.toBeInTheDocument();
  });

  it("calcula pagado solo con CONFIRMED y el saldo pendiente", () => {
    renderDetail({
      ...baseOrder,
      payments: [
        {
          id: "payment-1",
          amount: "100",
          payment_method: "BANK_TRANSFER",
          payment_date: "2026-07-24T10:00:00.000Z",
          payment_status: "CONFIRMED",
          type: "FULL",
          currency: "PEN",
        },
        {
          id: "payment-2",
          amount: "50",
          payment_method: "YAPE",
          payment_date: "2026-07-25T10:00:00.000Z",
          payment_status: "PENDING",
          type: "INSTALLMENTS",
        },
        {
          id: "payment-3",
          amount: "20",
          payment_method: "CASH",
          payment_date: "2026-07-26T10:00:00.000Z",
          payment_status: "REFUNDED",
        },
      ],
    });

    expect(screen.getByText("Total pagado").parentElement).toHaveTextContent(
      /S\/\s*100\.00/,
    );
    expect(screen.getByText("Saldo pendiente").parentElement).toHaveTextContent(
      /S\/\s*340\.00/,
    );
  });

  it("renderiza historial y plan vacíos", () => {
    renderDetail();

    expect(
      screen.getByText("Aún no se han registrado pagos para esta orden."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("No existe un plan de pagos asociado."),
    ).toBeInTheDocument();
  });

  it("renderiza pagos y cuotas existentes con sus traducciones", () => {
    renderDetail({
      ...baseOrder,
      payments: [
        {
          id: "payment-1",
          amount: "100",
          payment_method: "BANK_TRANSFER",
          payment_date: "2026-07-24T10:00:00.000Z",
          payment_status: "CONFIRMED",
          type: "INSTALLMENTS",
          currency: "PEN",
          transaccion_id: "TX-123",
          payment_receipt: "https://example.com/receipt.pdf",
        },
      ],
      paymentPlans: [
        {
          id: "plan-1",
          total_installments: 2,
          total_amount: "440",
          start_date: "2026-07-24T10:00:00.000Z",
          status: "PENDING",
          installments: [
            {
              id: "installment-1",
              number: 1,
              due_date: "2026-08-24T10:00:00.000Z",
              due_amount: "220",
              status: "PENDING",
            },
          ],
        },
      ],
    });

    expect(screen.getByText(/Transferencia bancaria/)).toBeInTheDocument();
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
    expect(screen.getAllByText("Cuotas").length).toBeGreaterThan(0);
    expect(screen.getByText("Transacción: TX-123")).toBeInTheDocument();
    expect(screen.getByText("Cuota 1")).toBeInTheDocument();
    expect(screen.getByText(/Vence 24 ago\.? 2026/)).toBeInTheDocument();
  });

  it("oculta acciones de escritura para roles sin permiso", () => {
    renderDetail(baseOrder, "MARKETING");

    expect(screen.queryByText("Editar")).not.toBeInTheDocument();
    expect(screen.queryByText("Registrar pago")).not.toBeInTheDocument();
  });

  it("oculta registrar pago para estados terminales", () => {
    renderDetail({ ...baseOrder, order_status: "COMPLETED" });

    expect(screen.queryByText("Registrar pago")).not.toBeInTheDocument();
    expect(screen.getAllByText("Editar").length).toBeGreaterThan(0);
  });

  it("usa una grilla responsive sin columnas rígidas en móvil", () => {
    renderDetail();
    const grid = screen.getByTestId("order-detail-grid");

    expect(grid).toHaveClass("grid", "min-w-0");
    expect(grid).toHaveClass(
      "lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]",
    );
    expect(grid).not.toHaveClass("grid-cols-3");
  });

  it("mantiene los UUID fuera de la cabecera y dentro de auditoría", () => {
    renderDetail();

    expect(screen.queryByText(baseOrder.id)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Información de auditoría"));
    const audit = screen.getByText("ID de orden").parentElement;
    expect(within(audit as HTMLElement).getByText(baseOrder.id)).toBeInTheDocument();
  });
});
