import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "@/core/components/ProtectedRoute";
import { useAuthStore, type User } from "@/store/useAuthStore";

const mocks = vi.hoisted(() => ({
  getUserById: vi.fn(),
  getSupervisorById: vi.fn(),
}));

vi.mock("@/features/users/services/userService", () => {
  class MockUserServiceError extends Error {
    constructor(
      public readonly status: number,
      message: string,
    ) {
      super(message);
      this.name = "UserServiceError";
    }
  }

  return {
    UserServiceError: MockUserServiceError,
    getUserById: mocks.getUserById,
    getSupervisorById: mocks.getSupervisorById,
  };
});

import { UserServiceError } from "@/features/users/services/userService";
import SalesSupervisorProfileView from "./SalesSupervisorProfileView";

const userId = "3abf13a7-df27-48ac-b6b5-b6afb5541251";

const supervisorUser: User = {
  id: userId,
  first_name: "Andrea",
  last_name: "Salazar",
  role: { name: "SALES_SUPERVISOR" },
};

const userResponse = {
  success: true,
  message: "User retrieved successfully",
  data: {
    id: userId,
    first_name: "Andrea",
    middle_name: "",
    last_name: "Salazar",
    email: "andrea@example.com",
    is_active: true,
    role: { name: "SALES_SUPERVISOR" },
  },
};

const supervisorResponse = {
  success: true,
  message: "supervisorDetails retrieved successfully",
  data: {
    id: "df3d7817-da09-4eb7-9847-a01d6002fbca",
    user_id: userId,
    discount_limit_percent: "12.50",
    max_manual_discount: null,
  },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  mocks.getUserById.mockReset();
  mocks.getSupervisorById.mockReset();
  mocks.getUserById.mockResolvedValue(userResponse);
  mocks.getSupervisorById.mockResolvedValue(supervisorResponse);
  useAuthStore.setState({
    user: supervisorUser,
    isAuthenticated: true,
    isLoading: false,
  });
});

afterEach(() => {
  cleanup();
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe("SalesSupervisorProfileView", () => {
  it("consulta ambos detalles con el User.id autenticado y muestra solo datos reales", async () => {
    render(<SalesSupervisorProfileView />, { wrapper: createWrapper() });

    await waitFor(() => expect(mocks.getUserById).toHaveBeenCalledWith(userId));
    expect(mocks.getSupervisorById).toHaveBeenCalledWith(userId);
    expect(mocks.getUserById).toHaveBeenCalledTimes(1);
    expect(mocks.getSupervisorById).toHaveBeenCalledTimes(1);

    expect(await screen.findByText("andrea@example.com")).toBeInTheDocument();
    expect(await screen.findByText("12.50%")).toBeInTheDocument();
    expect(screen.queryByText("Descuento manual máximo")).not.toBeInTheDocument();
    expect(screen.queryByText("[object Object]")).not.toBeInTheDocument();
  });

  it("no consulta ningún endpoint cuando el User.id no es un UUID válido", () => {
    useAuthStore.setState({
      user: { ...supervisorUser, id: "" },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<SalesSupervisorProfileView />, { wrapper: createWrapper() });

    expect(mocks.getUserById).not.toHaveBeenCalled();
    expect(mocks.getSupervisorById).not.toHaveBeenCalled();
    expect(screen.getByText(/identificador válido/i)).toBeInTheDocument();
  });

  it("muestra un estado vacío cuando el backend no devuelve perfil de supervisor", async () => {
    mocks.getSupervisorById.mockResolvedValue({ ...supervisorResponse, data: null });

    render(<SalesSupervisorProfileView />, { wrapper: createWrapper() });

    expect(
      await screen.findByText("No existe un perfil de supervisor asociado a esta cuenta."),
    ).toBeInTheDocument();
  });

  it("tolera campos opcionales null y presenta errores HTTP legibles", async () => {
    mocks.getUserById.mockResolvedValue({
      ...userResponse,
      data: { ...userResponse.data, middle_name: null },
    });
    mocks.getSupervisorById.mockRejectedValue(
      new UserServiceError(403, "Forbidden"),
    );

    render(<SalesSupervisorProfileView />, { wrapper: createWrapper() });

    expect(await screen.findByText("Andrea Salazar")).toBeInTheDocument();
    expect(
      await screen.findByText("No tienes permiso para consultar esta información."),
    ).toBeInTheDocument();
  });

  it("mantiene el acceso de /mi-perfil restringido a SALES_SUPERVISOR", async () => {
    useAuthStore.setState({
      user: { ...supervisorUser, role: { name: "SALES_REP" } },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/mi-perfil"]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={["SALES_SUPERVISOR"]} />}>
            <Route path="/mi-perfil" element={<div>Contenido privado</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>Acceso denegado</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Acceso denegado")).toBeInTheDocument();
    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
  });
});
