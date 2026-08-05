import { describe, expect, it } from "vitest";
import { buildOrderListQuery, resolveOrderListScope } from "./orderListScope";

describe("order list scope", () => {
  it("scopes SALES_REP orders by the authenticated user id", () => {
    const scope = resolveOrderListScope("SALES_REP", " user-ana ");
    const query = buildOrderListQuery({
      page: 1,
      limit: 20,
      status: "ALL",
      creationOrder: "desc",
      generatedBy: scope.generatedBy,
    });

    expect(scope).toEqual({ isSalesRep: true, generatedBy: "user-ana", isReady: true });
    expect(query).toEqual({
      page: 1,
      limit: 20,
      creation_order: "desc",
      generated_by: "user-ana",
    });
  });

  it("waits for the authenticated id before querying as SALES_REP", () => {
    expect(resolveOrderListScope("SALES_REP")).toEqual({
      isSalesRep: true,
      isReady: false,
    });
  });

  it.each(["ADMIN", "SALES_SUPERVISOR"])(
    "%s queries all orders unless a creator is selected",
    (role) => {
      const scope = resolveOrderListScope(role, "user-admin");
      const query = buildOrderListQuery({
        page: 1,
        limit: 20,
        status: "PENDING",
        creationOrder: "desc",
        generatedBy: scope.generatedBy,
      });

      expect(scope).toEqual({ isSalesRep: false, isReady: true });
      expect(query).toEqual({
        page: 1,
        limit: 20,
        creation_order: "desc",
        order_status: "PENDING",
      });
    },
  );
});
