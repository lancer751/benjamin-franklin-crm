import { LayoutDashboard, Users, ShoppingCart, CreditCard, Megaphone, GraduationCap, CalendarDays, Settings, LogOut } from "lucide-react";

interface AppSidebarProps {
  active: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "prospectos", label: "Prospectos", icon: Users },
  { id: "ordenes", label: "Órdenes de Venta", icon: ShoppingCart },
  { id: "pagos", label: "Pagos", icon: CreditCard },
  { id: "campanas", label: "Campañas", icon: Megaphone },
  { id: "cursos", label: "Cursos", icon: GraduationCap },
  { id: "calendario", label: "Calendario Académico", icon: CalendarDays },
];

const AppSidebar = ({ active, onNavigate }: AppSidebarProps) => {
  return (
    <aside className="w-56 min-h-screen flex flex-col" style={{ backgroundColor: "hsl(222, 47%, 11%)" }}>
      {/* Brand */}
      <div className="px-5 py-6">
        <h1 className="text-sm font-bold tracking-wide" style={{ color: "hsl(0, 0%, 100%)" }}>The Precise Scholar</h1>
        <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: "hsl(220, 14%, 55%)" }}>Enrollment Management</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary-foreground"
                  : "hover:text-primary-foreground/80"
              }`}
              style={{
                backgroundColor: isActive ? "hsl(224, 76%, 48%)" : "transparent",
                color: isActive ? "hsl(0, 0%, 100%)" : "hsl(220, 14%, 65%)",
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: "hsl(220, 14%, 65%)" }}>
          <Settings size={18} /> Ajustes
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: "hsl(220, 14%, 65%)" }}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
