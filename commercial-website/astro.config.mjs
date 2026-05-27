// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      ECOMMERCE_API_URL: envField.string({
        context: "client",
        access: "public",
        default: "http://localhost:3000",
      }),
    },
  },
});
