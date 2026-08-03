import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const paymentFormMock = vi.hoisted(() => vi.fn());

vi.mock("../components/PaymentForm", () => ({
  default: (props: { preselectedOrderId?: string | null }) => {
    paymentFormMock(props);
    return <div>Formulario completo de pago</div>;
  },
}));

import CreatePaymentView from "./CreatePaymentView";

describe("CreatePaymentView", () => {
  it("funciona en /pagos/nuevo y entrega orderId para la precarga", () => {
    render(
      <MemoryRouter initialEntries={["/pagos/nuevo?orderId=order-123"]}>
        <CreatePaymentView />
      </MemoryRouter>,
    );
    expect(screen.getByText("Registrar pago")).toBeInTheDocument();
    expect(screen.getByText("Formulario completo de pago")).toBeInTheDocument();
    expect(paymentFormMock).toHaveBeenCalledWith({
      preselectedOrderId: "order-123",
    });
  });
});
