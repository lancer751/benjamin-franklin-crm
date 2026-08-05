import { describe, expect, it, vi } from "vitest";

const searchLeadsMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/leads/services/leadService", () => ({
  searchLeads: searchLeadsMock,
}));

import { searchOrderLeads } from "./orderService";

describe("searchOrderLeads", () => {
  it("sends assigned_to only when an advisor User.id is provided", async () => {
    searchLeadsMock.mockResolvedValue({ data: { leads: [] } });

    await searchOrderLeads({ search: "jos", assignedTo: " user-ana " });

    expect(searchLeadsMock).toHaveBeenCalledWith(
      {
        page: "1",
        limit: "10",
        search: "jos",
        assigned_to: "user-ana",
      },
      undefined,
    );
  });

  it("does not send an empty assigned_to filter", async () => {
    searchLeadsMock.mockResolvedValue({ data: { leads: [] } });

    await searchOrderLeads({ search: "jos" });

    expect(searchLeadsMock).toHaveBeenCalledWith(
      { page: "1", limit: "10", search: "jos" },
      undefined,
    );
  });
});
