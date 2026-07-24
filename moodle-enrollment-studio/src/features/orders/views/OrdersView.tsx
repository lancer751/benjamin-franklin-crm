import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Ban,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Edit,
  Eye,
  Loader2,
  MoreVertical,
  Package,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { Skeleton } from "@/core/components/ui/skeleton";
import { cn } from "@/core/lib/utils";
import { formatPEN } from "../components/orderDisplay";
import {
  orderStatusLabels,
  orderStatusStyles,
} from "../components/detail/orderDetailUtils";
import { useOrdersView } from "../hooks/useOrdersView";
import type { OrderListItem } from "../types";
import {
  canCancelOrder,
  canDeleteOrder,
  canRegisterPaymentFromList,
} from "../utils/orderPermissions";

const statusOptions = [
  ["ALL", "Todos"],
  ["PENDING", "Pendientes"],
  ["COMPLETED", "Completadas"],
  ["CANCELLED", "Canceladas"],
  ["REFUNDED", "Reembolsadas"],
] as const;

export default function OrdersView() {
  const controller = useOrdersView();

  const columns = useMemo<ColumnDef<OrderListItem>[]>(
    () => [
      {
        header: "Orden",
        accessorKey: "orderCode",
        cell: ({ row }) => {
          const order = row.original;
          const productCount = order.products.length;
          return (
            <div className="min-w-0 text-left">
              <p className="font-mono text-sm font-bold text-primary">
                {order.orderCode}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {format(new Date(order.createdAt), "dd MMM yyyy", {
                  locale: es,
                })}{" "}
                · {productCount}{" "}
                {productCount === 1 ? "producto" : "productos"}
              </p>
            </div>
          );
        },
      },
      {
        header: "Cliente",
        accessorFn: (order) => order.lead.fullName,
        cell: ({ row }) => {
          const lead = row.original.lead;
          return (
            <div className="min-w-0 text-left">
              <p className="truncate font-semibold" title={lead.fullName}>
                {lead.fullName}
              </p>
              {lead.email && (
                <p
                  className="max-w-[220px] truncate text-xs text-muted-foreground"
                  title={lead.email}
                >
                  {lead.email}
                </p>
              )}
              {lead.dni && (
                <p className="text-xs text-muted-foreground">DNI {lead.dni}</p>
              )}
            </div>
          );
        },
      },
      {
        header: "Productos",
        accessorFn: (order) => order.products[0]?.name ?? "",
        enableSorting: false,
        cell: ({ row }) => {
          const products = row.original.products;
          const firstProduct = products[0];
          return firstProduct ? (
            <div className="min-w-0 text-left">
              <p
                className="max-w-[230px] truncate font-medium"
                title={firstProduct.name}
              >
                {firstProduct.name}
              </p>
              {products.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  +{products.length - 1}{" "}
                  {products.length === 2
                    ? "producto adicional"
                    : "productos adicionales"}
                </p>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Sin productos
            </span>
          );
        },
      },
      {
        header: "Asesor",
        accessorFn: (order) => order.seller?.fullName ?? "",
        cell: ({ row }) => {
          const seller = row.original.seller;
          return seller ? (
            <div className="flex min-w-0 items-center gap-2 text-left">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {seller.initials || "AC"}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium" title={seller.fullName}>
                  {seller.fullName}
                </p>
                {seller.email && (
                  <p
                    className="max-w-[180px] truncate text-xs text-muted-foreground"
                    title={seller.email}
                  >
                    {seller.email}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Generada por el sistema
            </span>
          );
        },
      },
      {
        header: "Estado",
        accessorKey: "status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={orderStatusStyles[row.original.status]}
          >
            {orderStatusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        header: "Total",
        accessorFn: (order) => Number(order.totalAmount),
        cell: ({ row }) => {
          const order = row.original;
          const discount = Number(order.discount);
          return (
            <div className="text-left md:text-right">
              <p className="whitespace-nowrap font-bold">
                {formatPEN(order.totalAmount)}
              </p>
              {discount > 0 && (
                <p className="whitespace-nowrap text-xs text-muted-foreground">
                  Descuento: {formatPEN(order.discount)}
                </p>
              )}
            </div>
          );
        },
      },
      {
        header: "Fecha",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <time
            dateTime={row.original.createdAt}
            className="whitespace-nowrap text-sm"
          >
            {format(new Date(row.original.createdAt), "dd MMM yyyy", {
              locale: es,
            })}
          </time>
        ),
      },
      {
        header: "Acciones",
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div
              className="flex w-full justify-end"
              onClick={(event) => event.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Acciones de la orden ${order.orderCode}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52"
                  onClick={(event) => event.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      controller.navigateToDetail(order);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver detalle
                  </DropdownMenuItem>
                  {controller.permissions.canEdit && (
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                        controller.navigateToEdit(order);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {canRegisterPaymentFromList(
                    order,
                    controller.permissions,
                  ) && (
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                        controller.navigateToPayment(order);
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Registrar pago
                    </DropdownMenuItem>
                  )}
                  {canCancelOrder(order, controller.permissions) && (
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                        controller.setPendingAction({
                          kind: "cancel",
                          order,
                        });
                      }}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Anular
                    </DropdownMenuItem>
                  )}
                  {canDeleteOrder(order, controller.permissions) && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        controller.setPendingAction({
                          kind: "delete",
                          order,
                        });
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [controller],
  );

  const hasFilters =
    controller.search.trim().length > 0 ||
    controller.statusFilter !== "ALL";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de órdenes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta y administra las órdenes comerciales registradas.
          </p>
        </div>
        {controller.permissions.canCreate && (
          <Button type="button" onClick={controller.navigateToNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva orden
          </Button>
        )}
      </header>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Métricas de órdenes"
      >
        <MetricCard
          label="Total órdenes"
          value={controller.metrics.total}
          description="Histórico registrado"
          icon={<Receipt className="h-5 w-5" />}
          loading={controller.isLoading}
        />
        <MetricCard
          label="Completadas"
          value={controller.metrics.completed}
          description="Órdenes finalizadas"
          icon={<CheckCircle2 className="h-5 w-5" />}
          loading={controller.isLoading}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Pendientes"
          value={controller.metrics.pending}
          description="En seguimiento"
          icon={<ShoppingCart className="h-5 w-5" />}
          loading={controller.isLoading}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <MetricCard
          label="Total vendido"
          value={formatPEN(controller.metrics.totalSold)}
          description="Solo órdenes completadas"
          icon={<CircleDollarSign className="h-5 w-5" />}
          loading={controller.isLoading}
          iconClassName="bg-blue-50 text-blue-600"
        />
      </section>

      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold">Listado de órdenes</h2>
            <p className="text-xs text-muted-foreground">
              {controller.filteredOrders.length} resultados
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 sm:w-80">
              <span className="sr-only">Buscar órdenes</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={controller.search}
                onChange={(event) => controller.setSearch(event.target.value)}
                placeholder="Código, cliente, asesor o producto..."
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label>
              <span className="sr-only">Filtrar por estado</span>
              <select
                value={controller.statusFilter}
                onChange={(event) =>
                  controller.setStatusFilter(
                    event.target.value as typeof controller.statusFilter,
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-44"
              >
                {statusOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {controller.isLoading ? (
          <OrdersTableSkeleton />
        ) : controller.isError ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <Receipt className="mb-3 h-10 w-10 text-destructive/40" />
            <p className="font-semibold">No se pudieron cargar las órdenes.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa tu conexión e inténtalo nuevamente.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={controller.retry}
            >
              Reintentar
            </Button>
          </div>
        ) : controller.orders.length === 0 ? (
          <EmptyOrders
            canCreate={controller.permissions.canCreate}
            onCreate={controller.navigateToNew}
          />
        ) : controller.filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <Search className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-semibold">
              No se encontraron órdenes con los filtros aplicados.
            </p>
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                className="mt-3"
                onClick={() => {
                  controller.setSearch("");
                  controller.setStatusFilter("ALL");
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="min-w-0 p-3 sm:p-5">
            <CustomTable
              data={controller.filteredOrders}
              columns={columns}
              onRowClick={controller.navigateToDetail}
              enableSorting
              pageSize={8}
            />
          </div>
        )}
      </section>

      <AlertDialog
        open={Boolean(controller.pendingAction)}
        onOpenChange={(open) => {
          if (!open && !controller.isMutating) {
            controller.setPendingAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {controller.pendingAction?.kind === "delete"
                ? "¿Eliminar esta orden?"
                : "¿Anular esta orden?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {controller.pendingAction?.kind === "delete"
                ? "La eliminación es permanente y el backend puede rechazarla si existen pagos confirmados."
                : "La orden pasará al estado Cancelada. Esta acción utiliza el flujo existente de actualización."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={controller.isMutating}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={controller.confirmPendingAction}
              disabled={controller.isMutating}
              className={cn(
                controller.pendingAction?.kind === "delete" &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              )}
            >
              {controller.isMutating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar
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
  description,
  icon,
  loading,
  iconClassName,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
  iconClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-20" />
        ) : (
          <p className="mt-2 text-2xl font-bold">{value}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary",
          iconClassName,
        )}
      >
        {icon}
      </div>
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="space-y-3 p-5" aria-label="Cargando órdenes">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

function EmptyOrders({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <Package className="mb-3 h-12 w-12 text-muted-foreground/30" />
      <p className="font-semibold">No hay órdenes registradas.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Las órdenes creadas aparecerán en este listado.
      </p>
      {canCreate && (
        <Button type="button" className="mt-4" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva orden
        </Button>
      )}
    </div>
  );
}
