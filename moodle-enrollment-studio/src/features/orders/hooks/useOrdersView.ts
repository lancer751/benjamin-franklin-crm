import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  mapOrderApiError,
} from "../services/orderService";
import type { OrderCreationOrder, OrderListItem } from "../types";
import {
  getOrderListPermissions,
  type OrderListPermissions,
} from "../utils/orderPermissions";
import { orderQueryKeys } from "../queryKeys";

const EMPTY_ORDERS: OrderListItem[] = [];

export interface PendingOrderAction {
  kind: "cancel";
  order: OrderListItem;
}

export interface OrdersViewController {
  orders: OrderListItem[];
  filteredOrders: OrderListItem[];
  metrics: ReturnType<typeof calculateOrderListMetrics>;
  permissions: OrderListPermissions;
  search: string;
  statusFilter: OrderStatusFilter;
  creationOrder: OrderCreationOrder;
  pendingAction: PendingOrderAction | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  isMutating: boolean;
  setSearch: (value: string) => void;
  setStatusFilter: (value: OrderStatusFilter) => void;
  setCreationOrder: (value: OrderCreationOrder) => void;
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
  const [creationOrder, setCreationOrder] =
    useState<OrderCreationOrder>("desc");
  const [pendingAction, setPendingAction] =
    useState<PendingOrderAction | null>(null);

  const ordersQuery = useQuery({
    queryKey: orderQueryKeys.list({ page: 1, limit: 20, creation_order: creationOrder }),
    queryFn: async () => {
      const response = await getOrders({
        page: 1,
        limit: 20,
        creation_order: creationOrder,
      });
      return response.data.orders.map(mapOrderResponseToListItem);
    },
    placeholderData: keepPreviousData,
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

  const cancelMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: async () => {
      toast.success("Orden anulada correctamente");
      setPendingAction(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["seller-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["team-follow-up"] }),
      ]);
    },
    onError: (error) => {
      toast.error(mapOrderApiError(error));
    },
  });

  const confirmPendingAction = () => {
    if (!pendingAction) return;
    cancelMutation.mutate(pendingAction.order.id);
  };

  return {
    orders,
    filteredOrders,
    metrics,
    permissions,
    search,
    statusFilter,
    creationOrder,
    pendingAction,
    isLoading: ordersQuery.isLoading,
    isRefreshing: ordersQuery.isFetching && !ordersQuery.isLoading,
    isError: ordersQuery.isError,
    isMutating: cancelMutation.isPending,
    setSearch,
    setStatusFilter,
    setCreationOrder,
    setPendingAction,
    retry: () => {
      void ordersQuery.refetch();
    },
    navigateToNew: () => navigate("/ordenes/nueva"),
    navigateToDetail: (order) => navigate(`/ordenes/${order.id}`),
    navigateToEdit: (order) => navigate(`/ordenes/${order.id}/editar`),
    navigateToPayment: (order) =>
      navigate(`/pagos/nuevo?orderId=${order.id}`),
    confirmPendingAction,
  };
}
