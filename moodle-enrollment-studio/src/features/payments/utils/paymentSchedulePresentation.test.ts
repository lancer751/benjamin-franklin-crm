import { describe, expect, it } from "vitest";
import {
  distributeScheduleAmounts,
  scheduledObligationLabel,
} from "./paymentSchedulePresentation";

describe("paymentSchedulePresentation", () => {
  it("presenta matrícula y reinicia la numeración visual de las cuotas", () => {
    expect(scheduledObligationLabel(1, 600)).toBe("Matrícula");
    expect(scheduledObligationLabel(2, 600)).toBe("Cuota 1");
    expect(scheduledObligationLabel(5, 600)).toBe("Cuota 4");
  });

  it("empieza directamente en Cuota 1 cuando no existe matrícula", () => {
    expect(scheduledObligationLabel(1, 0)).toBe("Cuota 1");
    expect(scheduledObligationLabel(2, 0)).toBe("Cuota 2");
  });

  it("distribuye un saldo entre una o varias cuotas posteriores", () => {
    expect(distributeScheduleAmounts(3400, 600, 1)).toEqual(["600.00", "2800.00"]);

    const amounts = distributeScheduleAmounts(3400, 600, 4);
    expect(amounts).toEqual(["600.00", "700.00", "700.00", "700.00", "700.00"]);
    expect(amounts.reduce((sum, amount) => sum + Number(amount), 0)).toBe(3400);
  });
});
