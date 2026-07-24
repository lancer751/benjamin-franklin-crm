import { fireEvent, render, screen } from "@testing-library/react";
import { useForm, useWatch } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import type { OrderFormValues, OrderProduct } from "../types";
import { OrderItemRow } from "./OrderItemRow";

const longName =
  "Diplomado Internacional de Gestión Estratégica y Liderazgo Organizacional";

const products: OrderProduct[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: longName,
    sales_status: "ON_SALE",
    pricing_status: "VALID",
    edition: { edition_code: "2026-II" },
    prices: [{ attendance_mode: "VIRTUAL", cash_price: "1290.00" }],
  },
];

function Harness() {
  const form = useForm<OrderFormValues>({
    defaultValues: {
      lead_id: "",
      discount: "0.00",
      order_items: [
        { product_id: "", attendance_mode: "", discount_code: null },
      ],
    },
  });
  const item = useWatch({
    control: form.control,
    name: "order_items.0",
  });

  return (
    <>
      <OrderItemRow
        index={0}
        control={form.control}
        setValue={form.setValue}
        products={products}
        onRemove={vi.fn()}
      />
      <output data-testid="item-value">{JSON.stringify(item)}</output>
    </>
  );
}

describe("OrderItemRow", () => {
  it("usa una grilla responsive con producto como columna principal", () => {
    render(<Harness />);

    expect(screen.getByTestId("order-item-row")).toHaveClass(
      "xl:grid-cols-[minmax(260px,2fr)_minmax(150px,0.9fr)_minmax(130px,0.7fr)_minmax(180px,1fr)_40px]",
    );
  });

  it("muestra nombres completos y un dropdown con ancho suficiente", () => {
    render(<Harness />);
    fireEvent.click(
      screen.getByRole("combobox", { name: "Seleccionar producto" }),
    );

    const optionLabel = screen.getByText(longName);
    expect(optionLabel).toHaveClass("whitespace-normal", "break-words");
    expect(optionLabel.closest("[data-radix-popper-content-wrapper]")).toHaveTextContent(
      longName,
    );
    expect(
      optionLabel.closest("[data-radix-popper-content-wrapper]")?.firstElementChild,
    ).toHaveClass(
      "min-w-[min(420px,calc(100vw-2rem))]",
      "max-w-[calc(100vw-2rem)]",
      "z-50",
    );
  });

  it("autoselecciona la única modalidad y actualiza el precio", () => {
    render(<Harness />);
    fireEvent.click(
      screen.getByRole("combobox", { name: "Seleccionar producto" }),
    );
    fireEvent.click(screen.getByText(longName));

    expect(screen.getByTestId("item-value")).toHaveTextContent(
      '"attendance_mode":"VIRTUAL"',
    );
    expect(screen.getByText("S/ 1,290.00")).toBeInTheDocument();
  });
});
