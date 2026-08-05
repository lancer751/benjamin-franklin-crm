import { describe, expect, it } from "vitest";
import {
  adaptCampaignMembers,
  getPreferredPhone,
  unpackCampaignMembers,
} from "./leadAdapter";

const response = {
  success: true,
  message: "Members retrieved",
  data: {
    members: [
      {
        id: "member-angel",
        lead_id: "lead-angel",
        campaing_id: "campaign-1",
        status: "NUEVO",
        assigned_to: "seller-1",
        source: "WHATSAPP",
        created_at: "2026-08-05T15:12:54.529Z",
        updated_at: "2026-08-05T15:12:54.529Z",
        is_primary: true,
        lead: {
          id: "lead-angel",
          first_name: "Angel",
          middle_name: "",
          last_name: "Gallardo",
          email: "angel@example.com",
          lead_status: "ACTIVE",
          phones: [
            { number: "111111111", isPrincipal: false, type: "CELULAR" },
            { number: "987900634", isPrincipal: true, type: "WHATSAPP" },
          ],
        },
        assignedUser: { id: "seller-1", first_name: "Ana", last_name: "Romero" },
        _count: { leadInteractions: 0 },
      },
      {
        id: "member-juan",
        lead_id: "lead-juan",
        campaing_id: "campaign-1",
        status: "NUEVO",
        assigned_to: "seller-1",
        source: "WHATSAPP",
        created_at: "2026-08-05T15:13:54.529Z",
        updated_at: "2026-08-05T15:13:54.529Z",
        is_primary: false,
        lead: {
          id: "lead-juan",
          first_name: "Juan",
          middle_name: "",
          last_name: "",
          email: "juan@example.com",
          lead_status: "ACTIVE",
          phones: [{ number: "912312312", isPrincipal: false, type: "CELULAR" }],
        },
        assignedUser: { id: "seller-1", first_name: "Ana", last_name: "Romero" },
        _count: { leadInteractions: 0 },
      },
    ],
    total: 2,
    page: 1,
    limit: 20,
  },
};

describe("campaign members response adapter", () => {
  it("reads data.members and preserves member identity and status", () => {
    const page = unpackCampaignMembers(response);
    const leads = adaptCampaignMembers(page.members);
    const nuevo = leads.filter((lead) => lead.campaignsEngaging[0]?.status === "NUEVO");

    expect(page).toMatchObject({ total: 2, page: 1, limit: 20 });
    expect(leads).toHaveLength(2);
    expect(nuevo).toHaveLength(2);
    expect(leads[0].campaignsEngaging[0]).toMatchObject({
      id: "member-angel",
      lead_id: "lead-angel",
      campaing_id: "campaign-1",
      assigned_to: "seller-1",
      status: "NUEVO",
    });
    expect(leads.map((lead) => lead.fullName)).toEqual(["Angel Gallardo", "Juan"]);
    expect(leads.map((lead) => getPreferredPhone(lead.phones)?.number)).toEqual([
      "987900634",
      "912312312",
    ]);
  });
});
