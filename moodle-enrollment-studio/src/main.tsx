import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuraciones:
      refetchOnWindowFocus: false, // Evita que haga peticiones a Prisma cada vez que cambias de pestaña en Chrome
      retry: 1,                    // Si el backend falla, intenta 1 vez más antes de mostrar el error
      staleTime: 1000 * 60 * 5,    // Mantiene los datos "frescos" por 5 minutos antes de volver a pedirlos
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);