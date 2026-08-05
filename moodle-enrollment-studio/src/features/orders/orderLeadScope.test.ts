import { describe, expect, it } from "vitest";
import { resolveOrderLeadScope } from "./orderLeadScope";

describe("order lead scope", () => {
  it("uses the authenticated User.id for SALES_REP", () => {
    expect(resolveOrderLeadScope("SALES_REP", " user-ana ")).toEqual({
      isSalesRep: true,
      effectiveAssignedTo: "user-ana",
      isReady: true,
    });
  });

  it("waits for the authenticated user before searching as SALES_REP", () => {
    expect(resolveOrderLeadScope("SALES_REP")).toEqual({
      isSalesRep: true,
      isReady: false,
    });
  });

  it.each(["ADMIN", "SALES_SUPERVISOR"])(
    "%s does not add an assigned_to filter",
    (role) => {
      expect(resolveOrderLeadScope(role, "user-admin")).toEqual({
        isSalesRep: false,
        isReady: true,
      });
    },
  );
});
