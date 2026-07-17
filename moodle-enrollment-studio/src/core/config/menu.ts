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
  BarChart3,
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
    SALES_REP: [
      "academic:view", "calendar:view", //"courses:view",  //"professors:view",
      "commercial:view", "prospects:view", "pipeline:view", "orders:view", "products:view",
      "marketing:view", "admin:view", "seller:self-view",
    ],
    // MARKETING has access to Prospects/Pipeline and the Marketing dashboard configuration
    MARKETING: [
      "academic:view", "calendar:view", "products:view",
      "commercial:view", "prospects:view", "pipeline:view",
      "admin:view", "marketing:view"
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
      { to: "/admin/campanas", label: "Campañas", icon: Megaphone, permission: "marketing:view" },
      { to: "/seller/mi-desempeno", label: "Mi desempeño", icon: BarChart3, permission: "seller:self-view" },
      { to: "/productos", label: "Productos", icon: Package, permission: "products:view" },
      { to: "/comercial/seguimiento-equipo", label: "Seguimiento Equipo", icon: Layers, permission: "supervisor:team-view" },
      { to: "/prospectos", label: "Prospectos", icon: Users, permission: "prospects:view" },
      // { to: "/pipeline", label: "Pipeline", icon: Kanban, permission: "pipeline:view" },
      { to: "/ordenes", label: "Órdenes", icon: FileText, permission: "orders:view" },
    ],
  },
];
