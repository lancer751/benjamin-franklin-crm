import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { logout } from "@/features/auth/services/authService";
import { sidebarSections, SidebarSection, canAccess as canAccessGlobal } from "@/core/config/menu";
import { translateEnum, RoleTranslationsMap } from "@/core/utils/dictionaries";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
  }`;

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Subscribe precisely to Zustand store properties to ensure reactive re-renders
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Auxiliar function 'canAccess(permission: string)' that validates if the user has access to a group or menu item
  const canAccess = (permission: string): boolean => {
    if (!user) return false;
    const userRole = (typeof user.role === 'object' ? user.role?.name : user.role) || "";
    return canAccessGlobal(userRole, permission);
  };

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

    const filtered = sidebarSections
      .map((section) => {
        // 1. Check section permission using our single-parameter canAccess helper
        const isSectionAllowed = canAccess(section.permission);
        if (!isSectionAllowed) {
          return null;
        }

        // 2. Filter child items by permissions restriction using the same helper
        const filteredItems = section.items.filter((item) => {
          return canAccess(item.permission);
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

  // Collapsible navigation sections state with exclusive accordion behavior
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Cerrar el menú lateral en móvil al navegar
  useEffect(() => {
    if (onClose) {
      onClose();
    }
  }, [location.pathname]);

  // Dynamically calculate which section should be expanded based on current route
  useEffect(() => {
    const activeSection = filteredSections.find((section) =>
      section.items.some((item) => location.pathname.startsWith(item.to))
    );
    if (activeSection) {
      setActiveGroup(activeSection.title);
    }
  }, [location.pathname, filteredSections]);

  const toggleSection = (title: string) => {
    setActiveGroup((prev) => (prev === title ? null : title));
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar text-sidebar-foreground shrink-0 border-r border-sidebar-border/40 items-center justify-center p-4 transition-transform duration-300 ease-in-out md:relative md:w-[230px] flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <Loader2 className="h-6 w-6 animate-spin text-sidebar-foreground/60" />
      </aside>
    );
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar text-sidebar-foreground shrink-0 border-r border-sidebar-border/40 transition-transform duration-300 ease-in-out md:relative md:w-[230px] flex flex-col ${
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          BF
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-accent-foreground">PRAGMATIC CRM</p>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Benjamin Franklin</p>
        </div>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4 space-y-1">
        {filteredSections.map((section, index) => {
          const isOpen = activeGroup === section.title;
          const SectionIcon = section.icon;

          return (
            <div key={section.title} className="space-y-0.5">
              {/* Modern, subtle visual separator between business domain sections */}
              {index > 0 && <div className="my-2 border-t border-sidebar-border/25 mx-2" />}

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
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 truncate">
            {translateEnum(user?.role?.name, RoleTranslationsMap)}
          </p>
        </div>
      </div>
    </aside>
  );
}

