import { hcWithType } from "backend";
import { useAuthStore } from "@/store/useAuthStore";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = hcWithType(SERVER_URL, {
  fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
    // 1. Helper interno para inyectar headers comunes (CSRF y Credenciales)
    const prepareRequestInit = (init?: RequestInit): RequestInit => {
      const csrfToken = getCookie("xxx-csrf-access-token");
      const headers = new Headers(init?.headers);
      if (csrfToken) {
        headers.set("xxx-csrf-access-token", csrfToken);
      }
      return {
        ...init,
        headers,
        credentials: "include", // Crucial para cookies HttpOnly (Access y Refresh)
      };
    };

    // 2. Ejecutamos la petición original
const targetInput = input;

    // 🕵️‍♂️ LOG DE DEBUGGING PARA CHROME:
    console.log("=== FRONTEND API DEBUG ===");
    console.log("URL del Backend configurada en Vercel:", SERVER_URL);
    console.log("Intentando hacer fetch a:", targetInput);

    let res = await fetch(targetInput, prepareRequestInit(requestInit));

    // 🛑 INTERCEPTOR: Si el Access Token expiró (401 Unauthorized)
    if (res.status === 401) {
      const urlString = typeof targetInput === "string" ? targetInput : targetInput.toString();
      
      // Guardia para evitar bucles infinitos si la ruta que falla es el mismo login o refresh
      if (!urlString.includes("/auth/login") && !urlString.includes("/auth/refresh-access-token")) {
        try {

          // Disparamos la renovación del token de manera interna
          const refreshRes = await fetch(
            `${SERVER_URL}/api/auth/refresh-access-token`,
            prepareRequestInit({ method: "POST" })
          );

          if (refreshRes.ok) {
            // RE-INTENTO TRANSPARENTE: Volvemos a lanzar la petición original con las nuevas cookies
            res = await fetch(targetInput, prepareRequestInit(requestInit));
          } else {
            // Si el refresh falla (ej. Refresh Token también expiró)
            useAuthStore.getState().setUser(null);
          }
        } catch (error) {
          useAuthStore.getState().setUser(null);
        }
      }
    }

    return res;
  },
}).api;

function getCookie(name: string): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}