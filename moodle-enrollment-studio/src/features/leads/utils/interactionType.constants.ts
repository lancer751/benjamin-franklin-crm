import type { InteractionFormValues } from "../schemas/interactionFormSchema";

export type InteractionType = InteractionFormValues["type"];

export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  WEBSITE_FORM: "Formulario web",
  SELL: "Venta",
  WHATSAPP: "WhatsApp",
  EMAIL: "Correo",
  MEETING: "Reunión",
  CALL: "Llamada",
};

export const INTERACTION_TYPE_OPTIONS = (
  Object.keys(INTERACTION_TYPE_LABELS) as InteractionType[]
).map((value) => ({ value, label: INTERACTION_TYPE_LABELS[value] }));

export const interactionTypeLabel = (value?: string | null) => (
  value && value in INTERACTION_TYPE_LABELS
    ? INTERACTION_TYPE_LABELS[value as InteractionType]
    : value || "No especificado"
);
