import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import {
  createPayment,
  deletePayment,
  getPaymentById,
  getPayments,
  mapPaymentApiError,
  updatePayment,
  updatePaymentStatus,
} from "../services/paymentService";
import {
  mapPaymentResponseToDetail,
  mapPaymentResponseToListItem,
} from "../services/paymentMappers";
import type {
  CreatePaymentPayload,
  PaymentDetail,
  PaymentListItem,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  UpdatePaymentPayload,
  UpdatePaymentStatusPayload,
} from "../types";
import {
  calculatePaymentMetrics,
  filterPayments,
  getPaymentPermissions,
  type PaymentFilter,
  type PaymentMethodFilter,
  type PaymentTypeFilter,
} from "../utils/paymentLogic";

const EMPTY_PAYMENTS: PaymentListItem[] = [];

export function invalidatePaymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  paymentId?: string,
  orderId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: ["payments"] });
  if (paymentId) {
    void queryClient.invalidateQueries({
      queryKey: ["payments", "detail", paymentId],
    });
  }
  void queryClient.invalidateQueries({ queryKey: ["orders"] });
  if (orderId) {
    void queryClient.invalidateQueries({ queryKey: ["order", orderId] });
  }
}

export function usePaymentsView() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role.name);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentFilter>("ALL");
  const [method, setMethod] = useState<PaymentMethodFilter>("ALL");
  const [type, setType] = useState<PaymentTypeFilter>("ALL");

  const query = useQuery({
    queryKey: ["payments", "list-view"],
    queryFn: async () => {
      const response = await getPayments();
      return response.data.map(mapPaymentResponseToListItem);
    },
  });
  const payments = query.data ?? EMPTY_PAYMENTS;
  const filteredPayments = useMemo(
    () => filterPayments(payments, search, status, method, type),
    [payments, search, status, method, type],
  );

  return {
    payments,
    filteredPayments,
    metrics: useMemo(() => calculatePaymentMetrics(payments), [payments]),
    permissions: getPaymentPermissions(role),
    search,
    status,
    method,
    type,
    isLoading: query.isLoading,
    isError: query.isError,
    setSearch,
    setStatus,
    setMethod,
    setType,
    retry: () => void query.refetch(),
    clearFilters: () => {
      setSearch("");
      setStatus("ALL");
      setMethod("ALL");
      setType("ALL");
    },
    navigateToCreate: () => navigate("/pagos/nuevo"),
    navigateToDetail: (payment: PaymentListItem) =>
      navigate(`/pagos/${payment.id}`),
  };
}

export function usePayment(id?: string) {
  return useQuery({
    queryKey: ["payments", "detail", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<PaymentDetail> => {
      const response = await getPaymentById(id as string);
      return mapPaymentResponseToDetail(response.data);
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => createPayment(payload),
    onSuccess: (response) => {
      invalidatePaymentQueries(
        queryClient,
        response.data.id,
        response.data.order_id,
      );
      toast.success("Pago registrado correctamente");
      navigate(`/pagos/${response.data.id}`);
    },
    onError: (error) => toast.error(mapPaymentApiError(error)),
  });
}

export function useUpdatePayment(payment?: PaymentListItem | PaymentDetail) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePaymentPayload) =>
      updatePayment(payment?.id ?? "", payload),
    onSuccess: () => {
      invalidatePaymentQueries(queryClient, payment?.id, payment?.orderId);
      toast.success("Referencia de pago actualizada");
    },
    onError: (error) => toast.error(mapPaymentApiError(error)),
  });
}

export function useUpdatePaymentStatus(
  payment?: PaymentListItem | PaymentDetail,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePaymentStatusPayload) =>
      updatePaymentStatus(payment?.id ?? "", payload),
    onSuccess: () => {
      invalidatePaymentQueries(queryClient, payment?.id, payment?.orderId);
      toast.success("Estado del pago actualizado");
    },
    onError: (error) => toast.error(mapPaymentApiError(error)),
  });
}

export function useDeletePayment(payment?: PaymentListItem | PaymentDetail) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deletePayment(payment?.id ?? ""),
    onSuccess: () => {
      invalidatePaymentQueries(queryClient, payment?.id, payment?.orderId);
      toast.success("Pago eliminado correctamente");
      navigate("/pagos");
    },
    onError: (error) => toast.error(mapPaymentApiError(error)),
  });
}

export const paymentMethods: PaymentMethod[] = [
  "YAPE",
  "ONLINE",
  "POS",
  "CASH",
  "BANK_TRANSFER",
];
export const paymentStatuses: PaymentStatus[] = [
  "CONFIRMED",
  "REFUNDED",
  "FAILED",
];
export const paymentTypes: PaymentType[] = ["FULL", "INSTALLMENTS"];
