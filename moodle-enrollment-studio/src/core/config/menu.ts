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
  LucideIcon,
} from "lucide-react";

export interface SidebarItem {
  to: string;
  label: string;
  icon: LucideIcon;
  allowedRoles?: string[];
}

export interface SidebarSection {
  title: string;
  icon: LucideIcon;
  items: SidebarItem[];
  allowedRoles?: string[];
}
export const sidebarSections: SidebarSection[] = [
  {
    title: "Administración",
    icon: ShieldCheck,
    allowedRoles: ["ADMIN"],
    items: [
      { to: "/admin/usuarios", label: "Usuarios", icon: Users, allowedRoles: ["ADMIN"] },
      { to: "/admin/cursos", label: "Cursos & Ediciones", icon: GraduationCap, allowedRoles: ["ADMIN"] },
      { to: "/admin/calendario", label: "Calendario Académico", icon: CalendarDays, allowedRoles: ["ADMIN"] },
      { to: "/admin/profesores", label: "Profesores", icon: GraduationCap, allowedRoles: ["ADMIN"] },
    ],
  },
  {
    title: "Ventas",
    icon: TrendingUp,
    allowedRoles: ["ADMIN", "SALES_REP", "SALES_SUPERVISOR"], // Corregido
    items: [
      { to: "/prospectos", label: "Prospectos", icon: Users, allowedRoles: ["ADMIN", "SALES_REP", "SALES_SUPERVISOR"] }, // Corregido
      { to: "/pipeline", label: "Pipeline", icon: Kanban, allowedRoles: ["ADMIN", "SALES_REP", "SALES_SUPERVISOR"] }, // Corregido
      { to: "/ordenes", label: "Órdenes", icon: FileText, allowedRoles: ["ADMIN", "SALES_REP", "SALES_SUPERVISOR"] }, // Corregido
      { to: "/productos", label: "Productos", icon: Package, allowedRoles: ["ADMIN", "SALES_REP", "SALES_SUPERVISOR"] }, // Corregido
    ],
  },
  {
    title: "Finanzas",
    icon: Wallet,
    allowedRoles: ["ADMIN", "SALES_SUPERVISOR"], // Corregido
    items: [
      { to: "/pagos", label: "Pagos", icon: CreditCard, allowedRoles: ["ADMIN", "SALES_SUPERVISOR"] }, // Corregido
    ],
  },
  {
    title: "Marketing",
    icon: Speaker,
    allowedRoles: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP"], // Corregido
    items: [
      { to: "/campanas", label: "Campañas", icon: Megaphone, allowedRoles: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP"] }, // Corregido
    ],
  },
];