import { hcWithType } from "backend";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = hcWithType(SERVER_URL, {
  // Sobrescribimos el fetch para inyectar el header dinámicamente
  fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
    // 1. Leemos la cookie pública de CSRF
    const csrfToken = getCookie("xxx-csrf-access-token");

    // 2. Preparamos los headers
    const headers = new Headers(requestInit?.headers);
    if (csrfToken) {
      headers.set("xxx-csrf-access-token", csrfToken);
    }

    // 3. Ejecutamos la petición original asegurando que viajen las cookies HTTP-Only
    return fetch(input, {
      ...requestInit,
      headers,
      credentials: "include", // Vital para que viajen el Access y Refresh token
    });
  },
}).api;

function getCookie(name: string): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));
  
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}