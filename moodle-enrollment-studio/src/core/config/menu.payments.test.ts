import { describe, expect, it } from "vitest";
import { canAccess, sidebarSections } from "./menu";

describe("menú de pagos", () => {
  const paymentsItem = sidebarSections
    .flatMap((section) => section.items)
    .find((item) => item.to === "/pagos");

  it("incluye Pagos dentro de Gestión Comercial", () => {
    const commercial = sidebarSections.find(
      (section) => section.title === "Gestión Comercial",
    );
    expect(commercial?.items).toContainEqual(
      expect.objectContaining({
        to: "/pagos",
        label: "Pagos",
        permission: "payments:view",
      }),
    );
    expect(paymentsItem).toBeDefined();
  });

  it("solo habilita el permiso para roles autorizados", () => {
    expect(canAccess("ADMIN", "payments:view")).toBe(true);
    expect(canAccess("SALES_REP", "payments:view")).toBe(true);
    expect(canAccess("SALES_SUPERVISOR", "payments:view")).toBe(true);
    expect(canAccess("MARKETING", "payments:view")).toBe(false);
    expect(canAccess("COLLECTIONS", "payments:view")).toBe(false);
  });
});
