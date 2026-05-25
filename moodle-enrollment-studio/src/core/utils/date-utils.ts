import { addMinutes } from "date-fns";

export const formatToLocalTime = (dateStr: string | Date | null | undefined): Date => {
  if (!dateStr) return new Date();
  
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  
  if (isNaN(date.getTime())) return new Date();

  return addMinutes(date, date.getTimezoneOffset());
};
 
export const displayFriendlyDate = (dateStr: string | Date | null | undefined): string => {
  const localDate = formatToLocalTime(dateStr);
  return localDate.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatFriendlySpanishDate = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "";
  const localDate = formatToLocalTime(dateStr);
  const day = localDate.getDate();
  const year = localDate.getFullYear();
  const monthName = localDate.toLocaleString("es-ES", { month: "long" });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${day} de ${capitalizedMonth}, ${year}`;
};