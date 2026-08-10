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
import type {
  GetOrdersParams,
  OrderCreationOrder,
  OrderListItem,
} from "../types";
import {
  getOrderListPermissions,
  type OrderListPermissions,
} from "../utils/orderPermissions";
import { orderQueryKeys } from "../queryKeys";
import { buildOrderListQuery, resolveOrderListScope } from "../orderListScope";
import { paymentsKeys } from "@/features/payments/queryKeys";
import { campaignMemberKeys, leadKeys } from "@/features/leads/queryKeys";
import { sellerKeys } from "@/features/users/queryKeys";

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
  isSalesRep: boolean;
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
  const user = useAuthStore((state) => state.user);
  const role = user?.role.name;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<OrderStatusFilter>("ALL");
  const [creationOrder, setCreationOrder] =
    useState<OrderCreationOrder>("desc");
  const [pendingAction, setPendingAction] =
    useState<PendingOrderAction | null>(null);

  const scope = useMemo(
    () => resolveOrderListScope(role, user?.id),
    [role, user?.id],
  );
  const queryParams = useMemo<GetOrdersParams>(
    () =>
      buildOrderListQuery({
        page: 1,
        limit: 20,
        status: statusFilter,
        creationOrder,
        generatedBy: scope.generatedBy,
      }),
    [creationOrder, scope.generatedBy, statusFilter],
  );

  const ordersQuery = useQuery({
    queryKey: orderQueryKeys.list(queryParams),
    queryFn: async () => {
      const response = await getOrders(queryParams);
      return response.data.orders.map(mapOrderResponseToListItem);
    },
    enabled: scope.isReady,
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
    onSuccess: async (_, orderId) => {
      toast.success("Orden anulada correctamente");
      setPendingAction(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(orderId) }),
        queryClient.invalidateQueries({ queryKey: paymentsKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: sellerKeys.details() }),
        queryClient.invalidateQueries({ queryKey: leadKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: campaignMemberKeys.lists() }),
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
    isSalesRep: scope.isSalesRep,
    pendingAction,
    isLoading: ordersQuery.isLoading || !scope.isReady,
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
