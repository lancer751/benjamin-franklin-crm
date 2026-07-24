import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm, useWatch } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { OrderFormValues, OrderLeadSummary } from "../types";

const searchOrderLeadsMock = vi.hoisted(() => vi.fn());

vi.mock("../services/orderService", () => ({
  searchOrderLeads: searchOrderLeadsMock,
}));

import { OrderLeadSection } from "./OrderLeadSection";

const lead: OrderLeadSummary = {
  id: "22222222-2222-4222-8222-222222222222",
  first_name: "Ana",
  last_name: "Pérez",
  email: "ana@example.com",
  lead_status: "ACTIVE",
  phones: [{ number: "999111222", isPrincipal: true }],
};

function LeadHarness({ mode = "create" }: { mode?: "create" | "edit" }) {
  const form = useForm<OrderFormValues>({
    defaultValues: {
      lead_id: mode === "edit" ? lead.id : "",
      discount: "0.00",
      order_items: [],
      order_status: "PENDING",
    },
  });
  const leadId = useWatch({ control: form.control, name: "lead_id" });

  return (
    <>
      <OrderLeadSection
        mode={mode}
        control={form.control}
        orderLead={mode === "edit" ? lead : undefined}
      />
      <output data-testid="lead-id">{leadId}</output>
    </>
  );
}

function renderHarness(mode: "create" | "edit" = "create") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LeadHarness mode={mode} />
    </QueryClientProvider>,
  );
}

function openAndType(value: string) {
  fireEvent.click(screen.getByRole("combobox"));
  fireEvent.change(
    screen.getByPlaceholderText("Nombre, celular o correo..."),
    { target: { value } },
  );
}

describe("OrderLeadSection", () => {
  beforeEach(() => {
    searchOrderLeadsMock.mockReset();
  });

  it("no consulta con 0 o 1 carácter", async () => {
    renderHarness();
    fireEvent.click(screen.getByRole("combobox"));
    expect(
      screen.getByText("Escribe al menos 2 caracteres."),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText("Nombre, celular o correo..."),
      { target: { value: "a" } },
    );

    await new Promise((resolve) => window.setTimeout(resolve, 400));
    expect(searchOrderLeadsMock).not.toHaveBeenCalled();
  });

  it("aplica debounce y consulta al escribir 2 caracteres", async () => {
    searchOrderLeadsMock.mockResolvedValue([]);
    renderHarness();
    openAndType("an");

    expect(searchOrderLeadsMock).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(searchOrderLeadsMock).toHaveBeenCalledWith(
        "an",
        expect.any(AbortSignal),
      ),
    );
  });

  it("muestra loading durante la consulta", async () => {
    searchOrderLeadsMock.mockReturnValue(new Promise(() => {}));
    renderHarness();
    openAndType("an");

    expect(await screen.findByText("Buscando prospectos…")).toBeInTheDocument();
  });

  it("renderiza resultados útiles y guarda lead_id al seleccionar", async () => {
    searchOrderLeadsMock.mockResolvedValue([lead]);
    renderHarness();
    openAndType("ana");

    expect(await screen.findByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText(/999111222/)).toHaveTextContent(
      "999111222 · ana@example.com",
    );
    expect(screen.getByText("Activo")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Ana Pérez"));

    expect(screen.getByTestId("lead-id")).toHaveTextContent(lead.id);
    expect(screen.getByText("Cambiar prospecto")).toBeInTheDocument();
    expect(
      screen.queryByText("Aún no has seleccionado un prospecto."),
    ).not.toBeInTheDocument();
  });

  it("muestra el estado vacío", async () => {
    searchOrderLeadsMock.mockResolvedValue([]);
    renderHarness();
    openAndType("nadie");

    expect(
      await screen.findByText("No se encontraron prospectos."),
    ).toBeInTheDocument();
  });

  it("muestra el error de consulta", async () => {
    searchOrderLeadsMock.mockRejectedValue(new Error("network"));
    renderHarness();
    openAndType("ana");

    expect(
      await screen.findByText(
        "No se pudo consultar los prospectos. Inténtalo nuevamente.",
      ),
    ).toBeInTheDocument();
  });

  it("muestra el prospecto en solo lectura durante la edición", () => {
    renderHarness("edit");

    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
