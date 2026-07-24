import type { AttendanceMode } from "../types";

export function formatPEN(value: string | number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  })
    .format(Number(value) || 0)
    .replace("PEN", "S/");
}

export function modeLabel(mode: AttendanceMode): string {
  const labels: Record<AttendanceMode, string> = {
    VIRTUAL: "Virtual",
    PRESENCIAL: "Presencial",
    HEREDADO: "Según edición",
  };
  return labels[mode];
}
