import { hcWithType } from "backend";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = hcWithType(SERVER_URL, {
  headers: {
    "Content-Type": "application/json",
  },
  init: {
    credentials: "include",
  }
}).api;
