import { AlertTriangle, MessageCircle, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react";

const overdueRecords = [
  { id: "MOR-001", student: "Roberto Sánchez", email: "r.sanchez@mail.com", phone: "901234567", course: "Ciberseguridad", installment: "3/6", amount: 300, dueDate: "2024-06-20", daysOverdue: 20, totalDebt: 1200 },
  { id: "MOR-002", student: "Elena Vargas", email: "e.vargas@mail.com", phone: "990123456", course: "Python Avanzado", installment: "1/3", amount: 216, dueDate: "2024-06-15", daysOverdue: 25, totalDebt: 650 },
  { id: "MOR-003", student: "Fernando Castro", email: "f.castro@mail.com", phone: "923456701", course: "Marketing Digital", installment: "2/4", amount: 222, dueDate: "2024-06-25", daysOverdue: 15, totalDebt: 445 },
  { id: "MOR-004", student: "Patricia Rojas", email: "p.rojas@mail.com", phone: "934567812", course: "Data Science", installment: "4/5", amount: 250, dueDate: "2024-06-28", daysOverdue: 12, totalDebt: 500 },
  { id: "MOR-005", student: "Manuel Gutiérrez", email: "m.gutierrez@mail.com", phone: "945678923", course: "Liderazgo", installment: "2/3", amount: 150, dueDate: "2024-07-01", daysOverdue: 9, totalDebt: 300 },
];

const OverdueView = () => {
  const totalDebt = overdueRecords.reduce((s, r) => s + r.totalDebt, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle size={24} className="text-destructive" />
            Gestión de Morosos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Cuotas vencidas con acciones rápidas de seguimiento.</p>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="rounded-xl bg-red-50 border border-red-200 p-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={24} className="text-red-600" />
        </div>
        <div>
          <p className="font-bold text-red-800">{overdueRecords.length} estudiantes con cuotas vencidas</p>
          <p className="text-sm text-red-600">Deuda total acumulada: S/ {totalDebt.toLocaleString()} • Promedio de atraso: {Math.round(overdueRecords.reduce((s, r) => s + r.daysOverdue, 0) / overdueRecords.length)} días</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-card border border-red-200 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Deuda Total</p>
          <p className="text-2xl font-bold text-destructive mt-2">S/ {totalDebt.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Casos Activos</p>
          <p className="text-2xl font-bold text-foreground mt-2">{overdueRecords.length}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Mayor Atraso</p>
          <p className="text-2xl font-bold text-foreground mt-2">{Math.max(...overdueRecords.map(r => r.daysOverdue))} días</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recuperación Est.</p>
          <p className="text-2xl font-bold text-emerald-600 mt-2">68%</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estudiante</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Curso</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cuota</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Monto</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Vencimiento</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Días Atraso</th>
              <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {overdueRecords.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-red-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-700">
                      {r.student.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{r.student}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground">{r.course}</td>
                <td className="px-6 py-4 text-foreground">{r.installment}</td>
                <td className="px-6 py-4 font-semibold text-destructive">S/ {r.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-foreground">{r.dueDate}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${
                    r.daysOverdue > 20 ? "bg-red-100 text-red-700" : r.daysOverdue > 10 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {r.daysOverdue} días
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="h-8 w-8 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 hover:bg-emerald-200 transition-colors" title="Enviar WhatsApp">
                      <MessageCircle size={14} />
                    </button>
                    <button className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 hover:bg-blue-200 transition-colors" title="Llamar">
                      <Phone size={14} />
                    </button>
                    <button className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors" title="Enviar Email">
                      <Mail size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <span className="text-sm text-muted-foreground">Mostrando {overdueRecords.length} de {overdueRecords.length} registros morosos</span>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"><ChevronLeft size={16} /></button>
            <button className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</button>
            <button className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverdueView;
