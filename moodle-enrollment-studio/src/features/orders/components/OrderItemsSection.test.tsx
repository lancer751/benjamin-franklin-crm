import { fireEvent, render, screen } from "@testing-library/react";
import { useFieldArray, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import type { OrderFormValues } from "../types";
import { OrderItemsSection } from "./OrderItemsSection";

function Harness() {
  const form = useForm<OrderFormValues>({
    defaultValues: { lead_id: "", discount: "", order_items: [] },
  });
  const items = useFieldArray({ control: form.control, name: "order_items" });
  return (
    <OrderItemsSection
      control={form.control}
      setValue={form.setValue}
      fields={items.fields}
      products={[]}
      itemsEditable
      onAdd={() =>
        items.append({
          product_id: "",
          attendance_mode: "",
          discount_code: null,
        })
      }
      onRemove={items.remove}
    />
  );
}

describe("OrderItemsSection", () => {
  it("agrega y elimina productos", async () => {
    render(<Harness />);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Agregar producto" })[0],
    );
    expect(
      screen.getByRole("button", { name: "Eliminar producto 1" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Eliminar producto 1" }),
    );
    expect(screen.getByText("No hay productos en la orden")).toBeInTheDocument();
  });
});
