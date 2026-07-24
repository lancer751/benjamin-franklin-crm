import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Search, Bell, HelpCircle, Users, Menu, ArrowLeft, X, UserRound, LogOut, Loader2 } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "./Sidebar";
import { translateEnum, RoleTranslationsMap } from "@/core/utils/dictionaries";
import { Avatar, AvatarFallback } from "@/core/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth/hooks/useLogout";

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() || "U";

const MainLayout = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, placeholder } = useSearchStore();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const isSalesSupervisor = user?.role.name === "SALES_SUPERVISOR";

  const userAvatar = (
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
        {user ? getInitials(user.first_name, user.last_name) : <Users size={14} />}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* Backdrop Flotante (Fondo Oscurecido) visible solo en móviles cuando está abierto */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar dinámico y reactivo basado en roles */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="relative flex h-16 items-center justify-between border-b border-border bg-card px-6 shrink-0 gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Botón de Hamburguesa visible en móviles */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="block md:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-30 shrink-0"
              title="Abrir menú"
            >
              <Menu size={20} />
            </button>

            {/* Botón de lupa móvil */}
            {!isMobileSearchOpen && (
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors shrink-0"
                title="Buscar"
              >
                <Search size={20} />
              </button>
            )}

            {/* MODO ESCRITORIO */}
            <div className="hidden md:flex relative items-center gap-2 bg-muted rounded-lg px-4 py-2 w-full max-w-[400px]">
              <Search size={16} className="text-muted-foreground" />
              <input
                type="text"
                value={searchQuery} // 👈 1. Conectado a Zustand
                onChange={(e) => setSearchQuery(e.target.value)} // 👈 2. Actualiza Zustand
                placeholder={placeholder || "Buscar..."} // 👈 3. Placeholder dinámico
                className="bg-transparent text-sm outline-none w-full pr-8 placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  type="button"
                  className="absolute right-3 p-0.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted-foreground/10 transition-colors"
                  title="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* MODO MÓVIL - OVERLAY EXPANDIDO */}
            {isMobileSearchOpen && (
              <div className="absolute inset-x-0 top-0 h-16 bg-card z-50 px-4 flex items-center gap-3 animate-in fade-in duration-200">
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                  title="Volver"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={placeholder || "Buscar..."}
                    className="w-full bg-transparent text-base outline-none pr-8 placeholder:text-muted-foreground"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      type="button"
                      className="absolute right-0 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors shrink-0"
                      title="Limpiar búsqueda"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
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
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Rol: {translateEnum(user?.role?.name, RoleTranslationsMap)}
              </span>
              {isSalesSupervisor ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="rounded-full outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Abrir menú de usuario"
                  >
                    {userAvatar}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onSelect={() => navigate("/mi-perfil")} className="cursor-pointer">
                      <UserRound className="mr-2 h-4 w-4" aria-hidden="true" />
                      Mi perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      {logoutMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                      )}
                      {logoutMutation.isPending ? "Cerrando..." : "Cerrar sesión"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                userAvatar
              )}
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
