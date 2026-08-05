import { describe, expect, it } from "vitest";
import {
  adaptLeadToOrderContext,
  filterOrderLeadContextByAssignee,
} from "./orderLeadContextAdapter";

const response = {
  data: {
    id: "lead-1",
    first_name: "Ana",
    last_name: "Pérez",
    campaignsEngaging: [
      {
        id: "member-ana",
        campaing_id: "campaign-1",
        status: "MATRICULADO",
        assigned_to: "user-ana",
        assignedUser: { id: "user-ana", first_name: "Ana", last_name: "Asesora" },
        campaing: { name: "Campaña Ana", platform: "WEBSITE" },
      },
      {
        id: "member-enrique",
        campaing_id: "campaign-2",
        status: "MATRICULADO",
        assigned_to: "user-enrique",
        assignedUser: { id: "user-enrique", first_name: "Enrique", last_name: "Asesor" },
        campaing: { name: "Campaña Enrique", platform: "WEBSITE" },
      },
      {
        id: "member-pending",
        campaing_id: "campaign-3",
        status: "CONTACTADO",
        assignedUser: { id: "user-ana" },
        campaing: { name: "No matriculada", platform: "WEBSITE" },
      },
    ],
  },
};

describe("order lead context adapter", () => {
  it("only retains MATRICULADO members assigned to the sales representative", () => {
    const context = adaptLeadToOrderContext(response);
    expect(context).not.toBeNull();

    const filtered = filterOrderLeadContextByAssignee(context!, "user-ana");

    expect(filtered.matriculatedCampaigns).toEqual([
      expect.objectContaining({ memberId: "member-ana", assignedUserId: "user-ana" }),
    ]);
    expect(filtered.hasUnavailableMatriculatedCampaign).toBe(true);
  });

  it("keeps all MATRICULADO members for an administrator", () => {
    const context = adaptLeadToOrderContext(response);
    expect(context).not.toBeNull();

    expect(filterOrderLeadContextByAssignee(context!)).toMatchObject({
      hasUnavailableMatriculatedCampaign: false,
      matriculatedCampaigns: [
        { memberId: "member-ana" },
        { memberId: "member-enrique" },
      ],
    });
  });
});
