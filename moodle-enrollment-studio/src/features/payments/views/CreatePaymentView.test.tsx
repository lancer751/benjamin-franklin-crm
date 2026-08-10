import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import CreatePaymentView from "./CreatePaymentView";

describe("CreatePaymentView", () => {
  it("guía al usuario a registrar desde la orden", () => {
    render(<MemoryRouter><CreatePaymentView /></MemoryRouter>);
    expect(screen.getByText("Registra el pago desde la orden")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir a órdenes" })).toBeInTheDocument();
  });
});
