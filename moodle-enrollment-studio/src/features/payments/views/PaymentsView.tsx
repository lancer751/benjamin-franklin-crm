import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Eye, MoreVertical, RefreshCw, Search, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/core/components/CustomTable";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import { Skeleton } from "@/core/components/ui/skeleton";
import { PaymentStatusDialog } from "../components/PaymentStatusDialog";
import { PaymentStatusBadge } from "../components/paymentDisplay";
import { paymentStatuses, usePaymentsView } from "../hooks/usePayments";
import type { PaymentListItem, PaymentReviewStatus, PaymentStatus } from "../types";
import { formatPaymentDate, formatPaymentMoney } from "../utils/paymentFormat";
import { paymentMethodLabels, paymentStatusLabels } from "../utils/paymentLogic";

export default function PaymentsView() {
  const controller = usePaymentsView();
  const navigate = useNavigate();
  const [review, setReview] = useState<{ payment: PaymentListItem; action: PaymentReviewStatus } | null>(null);
  const columns = useMemo<ColumnDef<PaymentListItem>[]>(() => [
    {
      accessorKey: "paymentDate",
      header: "Fecha",
      cell: ({ row }) => formatPaymentDate(row.original.paymentDate, true),
    },
    {
      accessorKey: "clientName",
      header: "Prospecto",
      cell: ({ row }) => <span className="font-medium">{row.original.clientName}</span>,
    },
    {
      accessorKey: "orderCode",
      header: "Orden",
      cell: ({ row }) => (
        <button className="font-medium text-primary hover:underline" onClick={(event) => {
          event.stopPropagation();
          navigate(`/ordenes/${row.original.orderId}`);
        }}>{row.original.orderCode ?? "Sin código"}</button>
      ),
    },
    {
      accessorKey: "productName",
      header: "Producto / cuota",
      cell: ({ row }) => <div className="min-w-44"><p>{row.original.productName}</p><p className="text-xs text-muted-foreground">{row.original.installmentLabel ?? "Pago completo"}</p></div>,
    },
    { accessorKey: "method", header: "Método", cell: ({ row }) => paymentMethodLabels[row.original.method] },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => <span className="font-semibold">{formatPaymentMoney(row.original.amount, row.original.currency)}</span>,
    },
    { accessorKey: "registeredBy", header: "Registrado por" },
    { accessorKey: "status", header: "Estado", cell: ({ row }) => <PaymentStatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "Acción",
      cell: ({ row }) => (
        <div onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => controller.navigateToDetail(row.original)}><Eye className="mr-2 h-4 w-4" />Ver detalle</DropdownMenuItem>
              {controller.permissions.canReview && row.original.status === "PENDING" && (
                <>
                  <DropdownMenuItem onSelect={() => setReview({ payment: row.original, action: "CONFIRMED" })}><CheckCircle2 className="mr-2 h-4 w-4" />Confirmar pago</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onSelect={() => setReview({ payment: row.original, action: "FAILED" })}><XCircle className="mr-2 h-4 w-4" />Rechazar</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [controller, navigate]);

  if (controller.isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-52" /><Skeleton className="h-96 rounded-xl" /></div>;
  if (controller.isError) return <div className="rounded-xl border p-10 text-center"><XCircle className="mx-auto h-9 w-9 text-destructive" /><p className="mt-3 font-semibold">No se pudieron cargar los pagos.</p><Button className="mt-4" variant="outline" onClick={controller.retry}><RefreshCw className="mr-2 h-4 w-4" />Reintentar</Button></div>;

  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Pagos</h1><p className="text-sm text-muted-foreground">Validación y seguimiento de cobranzas.</p></header>
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="grid gap-3 border-b p-4 sm:grid-cols-[minmax(220px,1fr)_220px]">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Prospecto, orden, producto o usuario" value={controller.search} onChange={(event) => controller.setSearch(event.target.value)} /></div>
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={controller.status} onChange={(event) => controller.setStatus(event.target.value as "ALL" | PaymentStatus)}>
            <option value="ALL">Todos los estados</option>
            {paymentStatuses.map((status) => <option key={status} value={status}>{paymentStatusLabels[status]}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <CustomTable columns={columns} data={controller.filteredPayments} enableSorting pageSize={10} onRowClick={controller.navigateToDetail} emptyMessage="No hay pagos para los filtros seleccionados." />
        </div>
      </section>
      <PaymentStatusDialog payment={review?.payment ?? null} action={review?.action ?? null} onClose={() => setReview(null)} />
    </div>
  );
}
