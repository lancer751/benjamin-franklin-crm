/**
 * Regex para validar UUIDs en las rutas de Hono RPC.
 * Debe coincidir exactamente con la constante UUID_ROUTE del backend.
 */
export const UUID_PATH = ":id{[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}}" as const;

// Define las rutas base para cada rol
export const ROLE_HOME_ROUTES: Record<string, string> = {
  ADMIN: "/dashboard",
  SUPERVISOR: "/prospectos",
  SALES_REP: "/prospectos",
};