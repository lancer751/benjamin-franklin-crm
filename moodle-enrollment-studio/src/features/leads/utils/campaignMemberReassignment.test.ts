import { describe, expect, it } from "vitest";
import { CampaignServiceError } from "@/features/campaigns/services/campaignService";
import {
  canReassignCampaignMembers,
  mapCampaignMemberReassignmentError,
} from "./campaignMemberReassignment";

describe("campaign member reassignment permissions", () => {
  it.each(["ADMIN", "MARKETING", "SALES_SUPERVISOR"])(
    "%s can reassign campaign members",
    (role) => expect(canReassignCampaignMembers(role)).toBe(true),
  );

  it.each(["SALES_REP", "SUPERVISOR", undefined])(
    "%s cannot reassign campaign members",
    (role) => expect(canReassignCampaignMembers(role)).toBe(false),
  );

  it("maps known reassignment errors to friendly messages", () => {
    expect(
      mapCampaignMemberReassignmentError(
        new CampaignServiceError(403, "Forbidden"),
      ),
    ).toBe("No tienes permisos para reasignar prospectos.");
    expect(
      mapCampaignMemberReassignmentError(
        new Error("Target seller is not assigned to this campaign"),
      ),
    ).toBe("El asesor seleccionado no está vinculado a esta campaña.");
  });
});
