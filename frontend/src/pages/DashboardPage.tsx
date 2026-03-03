import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardList, TrendingUp } from "lucide-react";
import { mockStudents, mockEnrollments, mockCourses } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "hsl(199, 89%, 38%)",
  "hsl(162, 63%, 41%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(270, 60%, 55%)",
  "hsl(199, 89%, 58%)",
];

const DashboardPage = () => {
  const totalStudents = mockStudents.length;
  const totalCourses = mockCourses.length;
  const totalEnrollments = mockEnrollments.length;
  const avgStudentsPerCourse = totalCourses > 0 ? (totalEnrollments / totalCourses).toFixed(1) : "0";

  const barData = useMemo(() => {
    return mockCourses.map((course) => {
      const count = mockEnrollments.filter((e) => e.courseId === course.id).length;
      return { name: course.name.length > 20 ? course.name.slice(0, 18) + "…" : course.name, estudiantes: count, fullName: course.name };
    });
  }, []);

  const pieData = useMemo(() => {
    return mockCourses.map((course) => {
      const count = mockEnrollments.filter((e) => e.courseId === course.id).length;
      return { name: course.name.length > 18 ? course.name.slice(0, 16) + "…" : course.name, value: count };
    });
  }, []);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    mockEnrollments.forEach((e) => { counts[e.status] = (counts[e.status] || 0) + 1; });
    const labels: Record<string, string> = {
      ENROLLED: "Matriculado",
      WAITING_LIST: "En espera",
      PENDING: "Pendiente",
      APPROVED: "Aprobado",
      REJECTED: "Rechazado",
    };
    return Object.entries(counts).map(([status, value]) => ({
      name: labels[status] ?? status,
      value,
    }));
  }, []);

  const kpis = [
    { label: "Total Estudiantes", value: totalStudents, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Total Cursos", value: totalCourses, icon: BookOpen, color: "bg-success/10 text-success" },
    { label: "Total Matrículas", value: totalEnrollments, icon: ClipboardList, color: "bg-warning/10 text-warning" },
    { label: "Promedio/Curso", value: avgStudentsPerCourse, icon: TrendingUp, color: "bg-accent/10 text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Resumen general del sistema de matrículas.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Estudiantes por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(215, 15%, 50%)" }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 20%, 90%)",
                      borderRadius: "0.5rem",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="estudiantes" fill="hsl(199, 89%, 38%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Enrollment Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg">Distribución por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: "hsl(215, 15%, 50%)" }}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Distribución por Estado de Matrícula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} width={75} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 90%)",
                    borderRadius: "0.5rem",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="value" fill="hsl(162, 63%, 41%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
