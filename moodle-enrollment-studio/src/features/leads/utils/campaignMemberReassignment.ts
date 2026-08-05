import { CampaignServiceError } from "@/features/campaigns/services/campaignService";

export const canReassignCampaignMembers = (role?: string): boolean =>
  role === "ADMIN" || role === "MARKETING" || role === "SALES_SUPERVISOR";

export const mapCampaignMemberReassignmentError = (error: unknown): string => {
  if (error instanceof CampaignServiceError && error.status === 403) {
    return "No tienes permisos para reasignar prospectos.";
  }

  const message = error instanceof Error ? error.message : "";
  if (message.includes("Campaign member not found")) {
    return "El prospecto ya no pertenece a esta campaña.";
  }
  if (message.includes("Seller profile not found")) {
    return "El usuario seleccionado no tiene un perfil de asesor comercial.";
  }
  if (message.includes("Cannot reassign a lead to an inactive seller")) {
    return "El asesor seleccionado está inactivo.";
  }
  if (message.includes("Target seller is not assigned to this campaign")) {
    return "El asesor seleccionado no está vinculado a esta campaña.";
  }
  if (message.includes("Seller is not assigned to campaign")) {
    return "El asesor seleccionado no está vinculado a una o más campañas de los prospectos seleccionados.";
  }
  return "No se pudo reasignar el prospecto. Inténtalo nuevamente.";
};
