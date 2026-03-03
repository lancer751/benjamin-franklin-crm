import { Link, useLocation } from "react-router-dom";
import { GraduationCap, UserPlus, LayoutDashboard, BookOpen, Users, Receipt, Settings } from "lucide-react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Estudiantes", icon: Users },
    { to: "/courses", label: "Cursos", icon: BookOpen },
    { to: "/enrollments", label: "Matrículas", icon: Receipt },
    { to: "/course-management", label: "Gestión", icon: Settings },
    { to: "/enroll", label: "Nueva", icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              MoodleEnroll
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
};

export default AppLayout;
