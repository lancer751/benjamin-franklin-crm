import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/core/components/CustomTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";
import { Button } from "@/core/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Input } from "@/core/components/ui/input";
import { Skeleton } from "@/core/components/ui/skeleton";
import { PaymentEditDialog } from "../components/PaymentEditDialog";
import { PaymentStatusDialog } from "../components/PaymentStatusDialog";
import {
  PaymentStatusBadge,
} from "../components/paymentDisplay";
import {
  paymentMethods,
  paymentTypes,
  useDeletePayment,
  usePaymentsView,
} from "../hooks/usePayments";
import type { PaymentListItem, PaymentMethod, PaymentType } from "../types";
import {
  formatPaymentDate,
  formatPaymentMoney,
} from "../utils/paymentFormat";
import {
  paymentMethodLabels,
  paymentStatusLabels,
  paymentTypeLabels,
  type PaymentFilter,
  type PaymentMethodFilter,
  type PaymentTypeFilter,
} from "../utils/paymentLogic";

export default function PaymentsView() {
  const controller = usePaymentsView();
  const navigate = useNavigate();
  const [editPayment, setEditPayment] = useState<PaymentListItem | null>(null);
  const [statusPayment, setStatusPayment] =
    useState<PaymentListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentListItem | null>(null);
  const deleteMutation = useDeletePayment(deleteTarget ?? undefined);

  const columns = useMemo<ColumnDef<PaymentListItem>[]>(
    () => [
      {
        accessorKey: "transactionId",
        header: "Pago / transacción",
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="font-semibold">
              {row.original.transactionId ?? "Sin identificador"}
            </p>
            <p className="text-xs text-muted-foreground">
              Registrado {formatPaymentDate(row.original.createdAt)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "orderCode",
        header: "Orden",
        cell: ({ row }) => (
          <button
            type="button"
            className="text-left"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/ordenes/${row.original.orderId}`);
            }}
          >
            <span className="block font-semibold text-primary">
              {row.original.orderCode ?? "Código no disponible"}
            </span>
            <span className="text-xs text-muted-foreground">
              Total {formatPaymentMoney(row.original.orderTotal)}
            </span>
          </button>
        ),
      },
      {
        accessorFn: (payment) => payment.client.fullName,
        id: "client",
        header: "Cliente",
        cell: ({ row }) => (
          <div className="min-w-44">
            <p className="font-medium">{row.original.client.fullName}</p>
            {row.original.client.email && (
              <p className="truncate text-xs text-muted-foreground">
                {row.original.client.email}
              </p>
            )}
            {row.original.client.dni && (
              <p className="text-xs text-muted-foreground">
                DNI {row.original.client.dni}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "method",
        header: "Método",
        cell: ({ row }) => paymentMethodLabels[row.original.method],
      },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => paymentTypeLabels[row.original.type],
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "amount",
        header: "Monto",
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatPaymentMoney(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "paymentDate",
        header: "Fecha",
        cell: ({ row }) => (
          <span>{formatPaymentDate(row.original.paymentDate, true)}</span>
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => {
          const payment = row.original;
          const canChange =
            controller.permissions.canChangeStatus &&
            payment.status === "CONFIRMED";
          return (
            <div
              className="flex justify-end"
              onClick={(event) => event.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Acciones del pago ${
                      payment.transactionId ?? payment.id
                    }`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    onSelect={() => controller.navigateToDetail(payment)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalle
                  </DropdownMenuItem>
                  {controller.permissions.canEdit && (
                    <DropdownMenuItem onSelect={() => setEditPayment(payment)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar referencia
                    </DropdownMenuItem>
                  )}
                  {canChange && (
                    <DropdownMenuItem
                      onSelect={() => setStatusPayment(payment)}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Cambiar estado
                    </DropdownMenuItem>
                  )}
                  {controller.permissions.canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        disabled={payment.status === "CONFIRMED"}
                        onSelect={() => setDeleteTarget(payment)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {payment.status === "CONFIRMED"
                          ? "No se puede eliminar"
                          : "Eliminar"}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [controller, navigate],
  );

  if (controller.isLoading) return <PaymentsLoading />;

  if (controller.isError) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <XCircle className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 text-lg font-semibold">
          No se pudieron cargar los pagos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revisa tu conexión e inténtalo nuevamente.
        </p>
        <Button className="mt-5" variant="outline" onClick={controller.retry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    );
  }

  const hasFilters =
    controller.search.trim() ||
    controller.status !== "ALL" ||
    controller.method !== "ALL" ||
    controller.type !== "ALL";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta, registra y administra los pagos asociados a órdenes.
          </p>
        </div>
        {controller.permissions.canCreate && (
          <Button onClick={controller.navigateToCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar pago
          </Button>
        )}
      </header>

      <section
        aria-label="Métricas de pagos"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Total de pagos"
          value={String(controller.metrics.total)}
          icon={CreditCard}
        />
        <MetricCard
          label="Pagos confirmados"
          value={String(controller.metrics.confirmed)}
          icon={CheckCircle2}
          className="text-emerald-600"
        />
        <MetricCard
          label="Pagos fallidos"
          value={String(controller.metrics.failed)}
          icon={XCircle}
          className="text-red-600"
        />
        <MetricCard
          label="Monto confirmado"
          value={formatPaymentMoney(controller.metrics.confirmedAmount)}
          icon={Banknote}
          detail="Excluye fallidos y reembolsados"
        />
      </section>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid gap-3 border-b p-4 lg:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(150px,auto))]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              aria-label="Buscar pagos"
              placeholder="Transacción, orden, cliente o método"
              value={controller.search}
              onChange={(event) => controller.setSearch(event.target.value)}
            />
          </div>
          <FilterSelect
            ariaLabel="Filtrar por estado"
            value={controller.status}
            onChange={(value) =>
              controller.setStatus(value as PaymentFilter)
            }
            options={[
              ["ALL", "Todos los estados"],
              ...(["CONFIRMED", "REFUNDED", "FAILED"] as const).map(
                (status) => [status, paymentStatusLabels[status]] as const,
              ),
            ]}
          />
          <FilterSelect
            ariaLabel="Filtrar por método"
            value={controller.method}
            onChange={(value) =>
              controller.setMethod(value as PaymentMethodFilter)
            }
            options={[
              ["ALL", "Todos los métodos"],
              ...paymentMethods.map(
                (method: PaymentMethod) =>
                  [method, paymentMethodLabels[method]] as const,
              ),
            ]}
          />
          <FilterSelect
            ariaLabel="Filtrar por tipo"
            value={controller.type}
            onChange={(value) =>
              controller.setType(value as PaymentTypeFilter)
            }
            options={[
              ["ALL", "Todos los tipos"],
              ...paymentTypes.map(
                (type: PaymentType) =>
                  [type, paymentTypeLabels[type]] as const,
              ),
            ]}
          />
        </div>

        {controller.payments.length === 0 ? (
          <EmptyPayments
            canCreate={controller.permissions.canCreate}
            onCreate={controller.navigateToCreate}
          />
        ) : controller.filteredPayments.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">
              No se encontraron pagos con los filtros aplicados.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={controller.clearFilters}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <CustomTable
            columns={columns}
            data={controller.filteredPayments}
            enableSorting
            pageSize={8}
            onRowClick={controller.navigateToDetail}
            emptyMessage="No hay pagos registrados."
          />
        )}
        {hasFilters && controller.filteredPayments.length > 0 && (
          <p className="border-t px-4 py-3 text-xs text-muted-foreground">
            {controller.filteredPayments.length} resultado(s) con los filtros
            actuales.
          </p>
        )}
      </section>

      <PaymentEditDialog
        payment={editPayment}
        onClose={() => setEditPayment(null)}
      />
      <PaymentStatusDialog
        payment={statusPayment}
        onClose={() => setStatusPayment(null)}
      />
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar pago</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es permanente. Los pagos confirmados no pueden
              eliminarse; deben reembolsarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteMutation.mutate(undefined, {
                  onSuccess: () => setDeleteTarget(null),
                })
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  className = "text-primary",
}: {
  label: string;
  value: string;
  detail?: string;
  icon: typeof CreditCard;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
      </div>
      <div className={`rounded-xl bg-muted p-3 ${className}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function FilterSelect({
  ariaLabel,
  value,
  onChange,
  options,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <select
      aria-label={ariaLabel}
      className="h-10 rounded-md border bg-background px-3 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}

function EmptyPayments({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="p-12 text-center">
      <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">No hay pagos registrados.</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Los pagos de las órdenes aparecerán aquí.
      </p>
      {canCreate && (
        <Button className="mt-5" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar pago
        </Button>
      )}
    </div>
  );
}

function PaymentsLoading() {
  return (
    <div className="space-y-6" aria-label="Cargando pagos">
      <Skeleton className="h-10 w-52" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
