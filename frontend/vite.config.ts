import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000/",
        changeOrigin: true,
      },
    },
  },
  plugins: [react() , tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
}));
