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
} from "lucide-react";

export const sidebarSections = [
  {
    title: "Administración",
    icon: ShieldCheck,
    items: [
      { to: "/admin/usuarios", label: "Usuarios", icon: Users },
      { to: "/admin/cursos", label: "Cursos & Ediciones", icon: GraduationCap },
      { to: "/admin/calendario", label: "Calendario Académico", icon: CalendarDays },
      { to: "/admin/profesores", label: "Profesores", icon: GraduationCap },
    ],
  },
  {
    title: "Ventas",
    icon: TrendingUp,
    items: [
      { to: "/prospectos", label: "Prospectos", icon: Users },
      { to: "/pipeline", label: "Pipeline", icon: Kanban },
      { to: "/ordenes", label: "Órdenes", icon: FileText },
      { to: "/productos", label: "Productos", icon: Package },
    ],
  },
  {
    title: "Finanzas",
    icon: Wallet,
    items: [
      // { to: "/finanzas", label: "Dashboard", icon: DollarSign },
      { to: "/pagos", label: "Pagos", icon: CreditCard },
      // { to: "/planes-pago", label: "Planes de Pago", icon: CalendarCheck },
      // { to: "/morosos", label: "Morosos", icon: AlertTriangle },
    ],
  },
  {
    title: "Marketing",
    icon: Speaker,
    items: [
      // { to: "/marketing", label: "Dashboard", icon: BarChart3 },
      { to: "/campanas", label: "Campañas", icon: Megaphone },
      // { to: "/origen-leads", label: "Origen de Leads", icon: Target },
    ],
  },
];
