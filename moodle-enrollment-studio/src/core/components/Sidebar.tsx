import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { logout } from "@/features/auth/services/authService";
import { sidebarSections, SidebarSection } from "@/core/config/menu";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
  }`;

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Subscribe precisely to Zustand store properties to ensure reactive re-renders
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Agregar log de depuración del renderizado
  console.log("Sidebar rendered with user:", user);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Sesión cerrada");
      setUser(null);
      navigate("/login");
    },
    onError: () => {
      toast.error("Error al cerrar sesión");
    }
  });

  // Local state for dynamically filtered sections
  const [filteredSections, setFilteredSections] = useState<SidebarSection[]>([]);

  // Filter sidebar sections recursively when the user session becomes available or changes
  useEffect(() => {
    // Si está cargando, no hacemos nada ni intentamos filtrar con un usuario nulo
    if (isLoading) {
      return;
    }

    if (!user) {
      setFilteredSections([]);
      return;
    }

    const userRole = user.role?.name || "";
    console.log("DEBUG: filtrando con rol:", userRole);

    const filtered = sidebarSections
      .map((section) => {
        // 1. Check section roles restriction
        if (section.allowedRoles) {
          const isAllowed = section.allowedRoles.includes(userRole);
          console.log(`[RBAC Debug] Sección "${section.title}": roles permitidos =`, section.allowedRoles, `vs rol de usuario = "${userRole}" (Coincidencia exacta: ${isAllowed})`);
          if (!isAllowed) {
            return null;
          }
        }

        // 2. Filter child items by roles restriction
        const filteredItems = section.items.filter((item) => {
          if (item.allowedRoles) {
            const isAllowed = item.allowedRoles.includes(userRole);
            console.log(`[RBAC Debug] Item "${item.label}": roles permitidos =`, item.allowedRoles, `vs rol de usuario = "${userRole}" (Coincidencia exacta: ${isAllowed})`);
            if (!isAllowed) {
              return false;
            }
          }
          return true;
        });

        // 3. Keep section metadata but use filtered items list
        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section): section is Exclude<typeof section, null> => {
        // 4. Exclude completely any empty sections or unauthorized sections
        return section !== null && section.items.length > 0;
      });

    setFilteredSections(filtered);
  }, [user, isLoading]);

  // Collapsible navigation sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Dynamically calculate which sections should be initially expanded based on current route
  useEffect(() => {
    setOpenSections((prev) => {
      const open: Record<string, boolean> = { ...prev };
      filteredSections.forEach((section) => {
        const containsActiveRoute = section.items.some((item) =>
          location.pathname.startsWith(item.to)
        );
        if (containsActiveRoute && prev[section.title] === undefined) {
          open[section.title] = true;
        }
      });
      return open;
    });
  }, [location.pathname, filteredSections]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Generate dynamic profile details from logged-in user state
  const userName = user?.first_name || "Usuario";
  const userInitials = useMemo(() => {
    if (!user?.first_name) return "US";
    return user.first_name.substring(0, 2).toUpperCase();
  }, [user?.first_name]);
  const userRoleLabel = user?.role?.name || "INVITADO";

  // Si isLoading es true o el usuario aún no existe, mostramos el Loader para evitar parpadeos
  if (isLoading || !user) {
    return (
      <aside className="flex w-[230px] flex-col bg-sidebar text-sidebar-foreground shrink-0 border-r border-sidebar-border/40 items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-sidebar-foreground/60" />
      </aside>
    );
  }

  // Agregar console.log justo antes del return final
  console.log("Sidebar FINAL RENDER con usuario:", user?.first_name, "y rol:", user?.role?.name);

  return (
    <aside className="flex w-[230px] flex-col bg-sidebar text-sidebar-foreground shrink-0 border-r border-sidebar-border/40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          M
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-accent-foreground">Moodle Manager</p>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Enrollment Suite</p>
        </div>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {filteredSections.map((section) => {
          const isOpen = openSections[section.title] ?? false;
          const SectionIcon = section.icon;

          return (
            <div key={section.title}>
              {/* Section toggle button */}
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent/40 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <SectionIcon size={16} />
                  {section.title}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 text-sidebar-foreground/40 ${
                    isOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </button>

              {/* Collapsible children with hierarchy line */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-[22px] border-l border-sidebar-foreground/15 pl-0 space-y-0.5 py-1">
                  {section.items.map((item) => (
                    <NavLink key={item.to} to={item.to} className={navLinkClass}>
                      <item.icon size={15} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="border-t border-sidebar-border px-3 py-3 space-y-0.5">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors">
          <Settings size={16} /> Ajustes
        </button>
        <button 
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {logoutMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          {logoutMutation.isPending ? "Cerrando..." : "Cerrar Sesión"}
        </button>
      </div>

      {/* Dynamic User Profile Card */}
      <div className="flex items-center gap-3 border-t border-sidebar-border px-4 py-4">
        <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{userName}</p>
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 truncate">{userRoleLabel}</p>
        </div>
      </div>
    </aside>
  );
}

