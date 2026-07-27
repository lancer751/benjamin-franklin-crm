import { DurationUnitMap, EditionStatusMap } from "@/core/utils/dictionaries";
import type { UIProduct } from "../types/product.types";

const MODALITY_LABELS: Record<string, string> = {
  VIRTUAL: "Virtual",
  PRESENCIAL: "Presencial",
  HIBRIDO: "Presencial y virtual",
  ASINCRONICO: "Asincrónico",
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
