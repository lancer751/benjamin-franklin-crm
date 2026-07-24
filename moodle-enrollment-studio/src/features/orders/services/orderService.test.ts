import { beforeEach, describe, expect, it, vi } from "vitest";

const searchLeadsMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/leads/services/leadService", () => ({
  searchLeads: searchLeadsMock,
}));

vi.mock("@/features/products/services/productService", () => ({
  getProducts: vi.fn(),
}));

import { searchOrderLeads } from "./orderService";

describe("searchOrderLeads", () => {
  beforeEach(() => {
    searchLeadsMock.mockReset();
  });

  it("usa GET /api/leads con los parámetros reales de búsqueda", async () => {
    const signal = new AbortController().signal;
    searchLeadsMock.mockResolvedValue({
      success: true,
      data: { leads: [] },
    });

    await searchOrderLeads("ana", signal);

    expect(searchLeadsMock).toHaveBeenCalledWith(
      { page: "1", limit: "10", search: "ana" },
      signal,
    );
  });

  it("rechaza respuestas sin una lista válida", async () => {
    searchLeadsMock.mockResolvedValue({ success: false });

    await expect(searchOrderLeads("ana")).rejects.toThrow(
      "No se pudieron buscar prospectos.",
    );
  });
});
