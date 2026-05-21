import { Outlet } from "react-router-dom";
import { Search, Bell, HelpCircle, Users } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const { searchQuery, setSearchQuery, placeholder } = useSearchStore();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar dinámico y reactivo basado en roles */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shrink-0">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2 w-[400px]">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              value={searchQuery} // 👈 1. Conectado a Zustand
              onChange={(e) => setSearchQuery(e.target.value)} // 👈 2. Actualiza Zustand
              placeholder={placeholder || "Buscar..."} // 👈 3. Placeholder dinámico
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle size={20} />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <span className="text-xs text-muted-foreground">Rol: {user?.role?.name || "INVITADO"}</span>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Users size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
