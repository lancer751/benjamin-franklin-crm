import { CalendarCheck, ChevronLeft, ChevronRight, Eye, AlertCircle, CheckCircle2 } from "lucide-react";

const plans = [
  { id: "PP-001", student: "Carlos Mendoza", course: "Data Science Avanzado", total: 1250, paid: 750, remaining: 500, installments: 5, paidInstallments: 3, nextDue: "2024-07-15", status: "AL DÍA" },
  { id: "PP-002", student: "Ana García", course: "UI/UX Bootcamp", total: 2100, paid: 700, remaining: 1400, installments: 6, paidInstallments: 2, nextDue: "2024-07-01", status: "AL DÍA" },
  { id: "PP-003", student: "Roberto Sánchez", course: "Ciberseguridad", total: 1800, paid: 600, remaining: 1200, installments: 6, paidInstallments: 2, nextDue: "2024-06-20", status: "ATRASADO" },
  { id: "PP-004", student: "Lucía Paredes", course: "Marketing Digital", total: 890, paid: 890, remaining: 0, installments: 4, paidInstallments: 4, nextDue: "-", status: "COMPLETADO" },
  { id: "PP-005", student: "Jorge Castillo", course: "Liderazgo", total: 450, paid: 150, remaining: 300, installments: 3, paidInstallments: 1, nextDue: "2024-07-10", status: "AL DÍA" },
  { id: "PP-006", student: "Elena Vargas", course: "Python Avanzado", total: 650, paid: 0, remaining: 650, installments: 3, paidInstallments: 0, nextDue: "2024-06-15", status: "ATRASADO" },
];

const PaymentPlansView = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planes de Pago</h1>
          <p className="text-sm text-muted-foreground mt-1">Seguimiento de cuotas e instalments de todos los estudiantes.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Planes Activos</p>
          <p className="text-2xl font-bold text-foreground mt-2">48</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Al Día</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">36</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Atrasados</p>
          <p className="text-2xl font-bold text-destructive mt-2">8</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Completados</p>
          <p className="text-2xl font-bold text-foreground mt-2">4</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estudiante</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Curso</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Progreso</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Restante</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Próx. Vencimiento</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => {
              const progress = Math.round((p.paidInstallments / p.installments) * 100);
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-primary">{p.id}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{p.student}</td>
                  <td className="px-6 py-4 text-foreground">{p.course}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{p.paidInstallments}/{p.installments}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">S/ {p.remaining.toLocaleString()}</td>
                  <td className="px-6 py-4 text-foreground">{p.nextDue}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${
                      p.status === "AL DÍA" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "ATRASADO" ? "bg-red-100 text-red-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {p.status === "AL DÍA" ? <CheckCircle2 size={12} /> : p.status === "ATRASADO" ? <AlertCircle size={12} /> : <CalendarCheck size={12} />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-muted-foreground hover:text-primary"><Eye size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="text-sm text-muted-foreground">Mostrando 6 de 48 planes</span>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"><ChevronLeft size={16} /></button>
            <button className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</button>
            <button className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-sm text-muted-foreground hover:bg-muted">2</button>
            <button className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPlansView;
