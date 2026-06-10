import {
  Users,
  Kanban,
  FileText,
  Package,
  CreditCard,
  Megaphone,
  ShieldCheck,
  GraduationCap,
  TrendingUp,
  Wallet,
  Speaker,
  CalendarDays,
  Award,
  HelpCircle,
  Gift,
  Layers,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface SidebarItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission: string;
}

export interface SidebarSection {
  title: string;
  icon: LucideIcon;
  permission: string;
  items: SidebarItem[];
}

export const canAccess = (userRole: string, permission: string): boolean => {
  // Define strict Role Based Access Control (RBAC) permission lists per business domain
  const permissions: Record<string, string[]> = {
    ADMIN: [
      "academic:view", "courses:view", "calendar:view", "professors:view",
      "commercial:view", "prospects:view", "pipeline:view", "orders:view", "products:view",
      "catalog:view", "certifications:view", "benefits:view", "faqs:view", "categories:view",
      "admin:view", "users:view", "finance:view", "marketing:view", "settings:view",
      "supervisor:team-view"
    ],
    // SALES_SUPERVISOR have full access to Academic, Commercial, and Support Catalog views
    SALES_SUPERVISOR: [
      "academic:view", "courses:view", "calendar:view", //"professors:view",
      "commercial:view", "prospects:view", "pipeline:view", "orders:view", "products:view",
      "catalog:view", "certifications:view", "benefits:view", "faqs:view", "categories:view",
      "admin:view", "marketing:view", "finance:view", "supervisor:team-view"
    ],
    // SALES_REP (Asesor de Ventas) has access only to Core Academic and Commercial modules
    SALES_REP: [
      "academic:view", "courses:view", "calendar:view", "professors:view",
      "commercial:view", "prospects:view", "pipeline:view", "orders:view", "products:view"
    ],
    // MARKETING has access to Prospects/Pipeline and the Marketing dashboard configuration
    MARKETING: [
      "commercial:view", "prospects:view", "pipeline:view",
      "admin:view",
    ],
    // COLLECTIONS (Cobranzas) has access to Orders and Finance dashboards
    COLLECTIONS: [
      "commercial:view", "orders:view",
      "admin:view", "finance:view"
    ]
  };

  return (permissions[userRole] || []).includes(permission);
};

export const sidebarSections: SidebarSection[] = [
  {
    title: "Administración",
    icon: ShieldCheck,
    permission: "admin:view",
    items: [
      { to: "/admin/usuarios", label: "Usuarios", icon: Users, permission: "users:view" },
      // { to: "/pagos", label: "Pagos", icon: Wallet, permission: "finance:view" },
      { to: "/campanas", label: "Campañas", icon: Megaphone, permission: "marketing:view" },
    ],
  },
  {
    title: "Gestión Académica",
    icon: GraduationCap,
    permission: "academic:view",
    items: [
      { to: "/admin/cursos", label: "Cursos & Ediciones", icon: GraduationCap, permission: "courses:view" },
      { to: "/admin/calendario", label: "Calendario Académico", icon: CalendarDays, permission: "calendar:view" },
      { to: "/admin/profesores", label: "Profesores", icon: Users, permission: "professors:view" },
    ],
  },
  {
    title: "Gestión Comercial",
    icon: TrendingUp,
    permission: "commercial:view",
    items: [
      { to: "/productos", label: "Productos", icon: Package, permission: "products:view" },
      { to: "/prospectos", label: "Prospectos", icon: Users, permission: "prospects:view" },
      // { to: "/pipeline", label: "Pipeline", icon: Kanban, permission: "pipeline:view" },
      { to: "/ordenes", label: "Órdenes", icon: FileText, permission: "orders:view" },
      { to: "/comercial/seguimiento-equipo", label: "Seguimiento Equipo", icon: Layers, permission: "supervisor:team-view" },
    ],
  },
];