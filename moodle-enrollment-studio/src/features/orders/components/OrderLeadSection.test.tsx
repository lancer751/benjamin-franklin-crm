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

interface LeadHarnessProps {
  mode?: "create" | "edit";
  isSalesRep?: boolean;
  leadSearchAssignedTo?: string;
  isLeadSearchReady?: boolean;
}

function LeadHarness({
  mode = "create",
  isSalesRep,
  leadSearchAssignedTo,
  isLeadSearchReady,
}: LeadHarnessProps) {
  const form = useForm<OrderFormValues>({
    defaultValues: {
      leadId: mode === "edit" ? lead.id : "",
      assigned_to: "",
      discount: "0.00",
      order_items: [],
      order_status: "PENDING",
    },
  });
  const leadId = useWatch({ control: form.control, name: "leadId" });

  return (
    <>
      <OrderLeadSection
        mode={mode}
        control={form.control}
        orderLead={mode === "edit" ? lead : undefined}
        isSalesRep={isSalesRep}
        leadSearchAssignedTo={leadSearchAssignedTo}
        isLeadSearchReady={isLeadSearchReady}
      />
      <output data-testid="lead-id">{leadId}</output>
    </>
  );
}

function renderHarness(props: LeadHarnessProps = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LeadHarness {...props} />
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
        { search: "an", assignedTo: undefined },
        expect.any(AbortSignal),
      ),
    );
  });

  it("incluye el User.id del asesor en la búsqueda", async () => {
    searchOrderLeadsMock.mockResolvedValue([]);
    renderHarness({
      isSalesRep: true,
      leadSearchAssignedTo: "user-ana",
    });
    openAndType("ana");

    await waitFor(() =>
      expect(searchOrderLeadsMock).toHaveBeenCalledWith(
        { search: "ana", assignedTo: "user-ana" },
        expect.any(AbortSignal),
      ),
    );
  });

  it("espera la sesión antes de buscar prospectos de un asesor", async () => {
    renderHarness({ isSalesRep: true, isLeadSearchReady: false });
    openAndType("ana");

    expect(
      await screen.findByText(
        "Esperando la sesión para buscar prospectos asignados.",
      ),
    ).toBeInTheDocument();
    expect(searchOrderLeadsMock).not.toHaveBeenCalled();
  });

  it("muestra loading durante la consulta", async () => {
    searchOrderLeadsMock.mockReturnValue(new Promise(() => {}));
    renderHarness();
    openAndType("an");

    expect(await screen.findByText("Buscando prospectos...")).toBeInTheDocument();
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
      await screen.findByText(
        "No se encontraron prospectos que coincidan con la búsqueda.",
      ),
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
    renderHarness({ mode: "edit" });

    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
