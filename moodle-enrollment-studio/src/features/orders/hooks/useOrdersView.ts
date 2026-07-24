import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import {
  calculateOrderListMetrics,
  filterOrderListItems,
  mapOrderResponseToListItem,
  type OrderStatusFilter,
} from "../services/orderListMappers";
import {
  deleteOrder,
  getOrders,
  updateOrder,
} from "../services/orderService";
import type { OrderListItem } from "../types";
import {
  getOrderListPermissions,
  type OrderListPermissions,
} from "../utils/orderPermissions";

const EMPTY_ORDERS: OrderListItem[] = [];

export interface PendingOrderAction {
  kind: "cancel" | "delete";
  order: OrderListItem;
}

export interface OrdersViewController {
  orders: OrderListItem[];
  filteredOrders: OrderListItem[];
  metrics: ReturnType<typeof calculateOrderListMetrics>;
  permissions: OrderListPermissions;
  search: string;
  statusFilter: OrderStatusFilter;
  pendingAction: PendingOrderAction | null;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  setSearch: (value: string) => void;
  setStatusFilter: (value: OrderStatusFilter) => void;
  setPendingAction: (value: PendingOrderAction | null) => void;
  retry: () => void;
  navigateToNew: () => void;
  navigateToDetail: (order: OrderListItem) => void;
  navigateToEdit: (order: OrderListItem) => void;
  navigateToPayment: (order: OrderListItem) => void;
  confirmPendingAction: () => void;
}

export function useOrdersView(): OrdersViewController {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role.name);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<OrderStatusFilter>("ALL");
  const [pendingAction, setPendingAction] =
    useState<PendingOrderAction | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["orders", "list-view"],
    queryFn: async () => {
      const response = await getOrders();
      return response.data.map(mapOrderResponseToListItem);
    },
  });

  const orders = ordersQuery.data ?? EMPTY_ORDERS;
  const filteredOrders = useMemo(
    () => filterOrderListItems(orders, search, statusFilter),
    [orders, search, statusFilter],
  );
  const metrics = useMemo(() => calculateOrderListMetrics(orders), [orders]);
  const permissions = useMemo(
    () => getOrderListPermissions(role),
    [role],
  );

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: async () => {
      toast.success("Orden eliminada correctamente");
      setPendingAction(null);
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("No se pudo eliminar la orden");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) =>
      updateOrder(id, { order_status: "CANCELLED" }),
    onSuccess: async () => {
      toast.success("Orden anulada correctamente");
      setPendingAction(null);
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("No se pudo anular la orden");
    },
  });

  const confirmPendingAction = () => {
    if (!pendingAction) return;
    if (pendingAction.kind === "delete") {
      deleteMutation.mutate(pendingAction.order.id);
    } else {
      cancelMutation.mutate(pendingAction.order.id);
    }
  };

  return {
    orders,
    filteredOrders,
    metrics,
    permissions,
    search,
    statusFilter,
    pendingAction,
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    isMutating: deleteMutation.isPending || cancelMutation.isPending,
    setSearch,
    setStatusFilter,
    setPendingAction,
    retry: () => {
      void ordersQuery.refetch();
    },
    navigateToNew: () => navigate("/ordenes/nueva"),
    navigateToDetail: (order) => navigate(`/ordenes/${order.id}`),
    navigateToEdit: (order) => navigate(`/ordenes/${order.id}/editar`),
    navigateToPayment: (order) =>
      navigate(`/ordenes/${order.id}?action=payment`),
    confirmPendingAction,
  };
}
