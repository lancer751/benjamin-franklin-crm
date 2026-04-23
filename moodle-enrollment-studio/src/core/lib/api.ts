import { hc } from "hono/client";
import type { ApiRoutes } from "../../../../backend/src/app"; 

// URL base del backend 
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/";

// Creamos la instancia del cliente pasando el tipo exacto de tus rutas
const client = hc<ApiRoutes>(BACKEND_URL);
export const api = client.api;