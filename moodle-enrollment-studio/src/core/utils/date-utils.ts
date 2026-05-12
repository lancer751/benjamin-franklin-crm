import { addMinutes } from "date-fns";

/**
 * Ajusta una fecha UTC proveniente del servidor para que se muestre 
 * correctamente en la zona horaria local sin perder un día.
 */
export const formatToLocalTime = (dateStr: string | Date | null | undefined): Date => {
  if (!dateStr) return new Date();
  
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  
  // Si la fecha es inválida, retornar hoy
  if (isNaN(date.getTime())) return new Date();

  // Sumamos el offset de la zona horaria para "empujar" la fecha
  // y neutralizar la resta automática del navegador.
  return addMinutes(date, date.getTimezoneOffset());
};

/**
 * Retorna la fecha formateada para mostrar en tablas o calendarios
 */
export const displayFriendlyDate = (dateStr: string | Date | null | undefined): string => {
  const localDate = formatToLocalTime(dateStr);
  return localDate.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};