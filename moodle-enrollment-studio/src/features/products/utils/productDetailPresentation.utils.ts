import { DurationUnitMap, EditionStatusMap } from "@/core/utils/dictionaries";
import type { UIProduct } from "../types/product.types";

const MODALITY_LABELS: Record<string, string> = {
  VIRTUAL: "Virtual",
  PRESENCIAL: "Presencial",
  HIBRIDO: "Presencial y virtual",
  ASINCRONICO: "Asincrónico",
};

const ATTENDANCE_MODE_VISUALS: Record<string, {
  accent: string;
  icon: string;
  primary: string;
}> = {
  VIRTUAL: {
    accent: "border-blue-100 bg-blue-50 text-blue-700",
    icon: "bg-blue-100 text-blue-700",
    primary: "border-blue-100 bg-blue-50/70",
  },
  PRESENCIAL: {
    accent: "border-emerald-100 bg-emerald-50 text-emerald-700",
    icon: "bg-emerald-100 text-emerald-700",
    primary: "border-emerald-100 bg-emerald-50/70",
  },
  ASINCRONICO: {
    accent: "border-violet-100 bg-violet-50 text-violet-700",
    icon: "bg-violet-100 text-violet-700",
    primary: "border-violet-100 bg-violet-50/70",
  },
  DEFAULT: {
    accent: "border-slate-200 bg-slate-100 text-slate-700",
    icon: "bg-slate-100 text-slate-600",
    primary: "border-slate-200 bg-slate-50",
  },
};

export const getEditionStatusLabel = (status?: string | null) =>
  status ? EditionStatusMap[status] || "Estado no definido" : "No definido";

export const getModalityLabel = (modality?: string | null) =>
  modality ? MODALITY_LABELS[modality] || "Otra modalidad" : "No definida";

export const getDurationUnitLabel = (unit?: string | null) => {
  if (!unit) return "";
  return (DurationUnitMap[unit] || "").toLocaleLowerCase("es");
};

export const getPricingStatusLabel = (status?: UIProduct["pricing_status"] | null) =>
  status === "VALID" ? "Precios válidos" : "Revisar precios";

export const getAttendanceModeLabel = (
  attendanceMode: UIProduct["prices"][number]["attendance_mode"],
  editionModality?: string | null,
  priceCount = 1,
) => {
  if (attendanceMode !== "HEREDADO") return getModalityLabel(attendanceMode);
  if (editionModality === "HIBRIDO" && priceCount === 1) return "General";
  return getModalityLabel(editionModality);
};

export const getAttendanceModeVisualConfig = (
  attendanceMode: UIProduct["prices"][number]["attendance_mode"],
  editionModality?: string | null,
) => {
  const resolvedMode = attendanceMode === "HEREDADO" ? editionModality : attendanceMode;
  return ATTENDANCE_MODE_VISUALS[resolvedMode || "DEFAULT"] || ATTENDANCE_MODE_VISUALS.DEFAULT;
};

export const formatProductCurrency = (amount?: string | number | null) => {
  if (amount == null || amount === "") return "No definido";
  const value = Number(amount);
  if (!Number.isFinite(value)) return "No definido";
  return `S/ ${value.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const getInstallmentRangeLabel = (minimum: number, maximum: number) =>
  minimum === maximum ? `${minimum} cuota${minimum === 1 ? "" : "s"}` : `${minimum} a ${maximum} cuotas`;
