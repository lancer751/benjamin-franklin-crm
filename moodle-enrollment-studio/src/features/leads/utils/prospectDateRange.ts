export type DateRangePreset =
  | "TODAY"
  | "YESTERDAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_YEAR"
  | "CUSTOM";

export interface ProspectDateRange {
  from: Date | null;
  to: Date | null;
  preset: DateRangePreset | null;
}

export const EMPTY_PROSPECT_DATE_RANGE: ProspectDateRange = {
  from: null,
  to: null,
  preset: null,
};

export const DATE_RANGE_PRESETS: Array<{ value: DateRangePreset; label: string }> = [
  { value: "TODAY", label: "Hoy" },
  { value: "YESTERDAY", label: "Ayer" },
  { value: "LAST_7_DAYS", label: "Últimos 7 días" },
  { value: "LAST_30_DAYS", label: "Últimos 30 días" },
  { value: "THIS_MONTH", label: "Este mes" },
  { value: "LAST_MONTH", label: "Mes pasado" },
  { value: "THIS_YEAR", label: "Este año" },
  { value: "CUSTOM", label: "Personalizado" },
];

const localDate = (year: number, month: number, day: number): Date => new Date(year, month, day);
const addLocalDays = (date: Date, amount: number): Date => localDate(date.getFullYear(), date.getMonth(), date.getDate() + amount);
const normalizeLocalDate = (date: Date): Date => localDate(date.getFullYear(), date.getMonth(), date.getDate());

export function resolveDateRangePreset(preset: Exclude<DateRangePreset, "CUSTOM">, now = new Date()): ProspectDateRange {
  const today = normalizeLocalDate(now);
  const year = today.getFullYear();
  const month = today.getMonth();

  switch (preset) {
    case "TODAY": return { from: today, to: today, preset };
    case "YESTERDAY": {
      const yesterday = addLocalDays(today, -1);
      return { from: yesterday, to: yesterday, preset };
    }
    case "LAST_7_DAYS": return { from: addLocalDays(today, -6), to: today, preset };
    case "LAST_30_DAYS": return { from: addLocalDays(today, -29), to: today, preset };
    case "THIS_MONTH": return { from: localDate(year, month, 1), to: today, preset };
    case "LAST_MONTH": return { from: localDate(year, month - 1, 1), to: localDate(year, month, 0), preset };
    case "THIS_YEAR": return { from: localDate(year, 0, 1), to: today, preset };
  }
}

export const serializeLocalDate = (date: Date): string => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (date: Date, includeYear: boolean): string => new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "short",
  ...(includeYear && { year: "numeric" }),
}).format(date);

export const formatDateRangeLabel = (range: ProspectDateRange): string => {
  if (!range.from || !range.to) return "Cualquier fecha";
  const includeStartYear = range.from.getFullYear() !== range.to.getFullYear();
  return `${formatDate(range.from, includeStartYear)} – ${formatDate(range.to, true)}`;
};

export const formatDateField = (date: Date | null): string => date
  ? new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date)
  : "Seleccionar";

export const isValidProspectDateRange = (range: ProspectDateRange): boolean => Boolean(
  range.from && range.to && range.to.getTime() >= range.from.getTime(),
);
