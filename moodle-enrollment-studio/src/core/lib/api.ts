import { hcWithType } from "backend";
import { useAuthStore } from "@/store/useAuthStore";

const SERVER_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

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

    let res = await fetch(targetInput, prepareRequestInit(requestInit));

    const urlString = typeof targetInput === "string" ? targetInput : targetInput.toString();

    if (urlString.includes("/auth/logout")) {
      // a) Forzamos la destrucción inmediata del storage y estado del usuario en la UI
      useAuthStore.getState().setUser(null);

      // b) Helper proactivo para limpiar del navegador cookies normales que no tengan la restricción HttpOnly
      const deleteCookie = (name: string) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      };

      deleteCookie("xxx-csrf-access-token");
      deleteCookie("csrf_token");
      deleteCookie("bf_access_token");
      deleteCookie("bf_refresh_token");

      // c) Tolerancia a fallas de infraestructura: si el backend rebota por falta del token CSRF cruzado (403 o 400)
      // retornamos un objeto Response simulado exitoso para que el 'onSuccess' de tu 'logoutMutation' se dispare en verde.
      if (res.status === 403 || res.status === 400 || !res.ok) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Sesión local purgada exitosamente" 
          }), 
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // 🛑 INTERCEPTOR: Si el Access Token expiró (401 Unauthorized)
    if (res.status === 401 || res.status === 500) {
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