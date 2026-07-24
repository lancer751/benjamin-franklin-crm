import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrderById, getOrders } from "@/features/orders/services/orderService";
import {
  generateInstallments,
  mapOrderResponseToPaymentOption,
  mapPaymentFormToCreatePayload,
  moneyString,
} from "../services/paymentMappers";
import type {
  PaymentFormValues,
  PaymentOrderOption,
  PaymentType,
  ScheduledPaymentFormValue,
} from "../types";
import { normalizePaymentSearch, validatePaymentForm } from "../utils/paymentLogic";
import { useCreatePayment } from "./usePayments";

function localDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const initialValues: PaymentFormValues = {
  orderId: "",
  paymentDate: localDateTime(),
  amount: "",
  paymentMethod: "YAPE",
  paymentStatus: "CONFIRMED",
  type: "FULL",
  currency: "PEN",
  transactionId: "",
  paymentPlan: {
    totalInstallments: "3",
    totalAmount: "",
    startDate: today(),
    scheduledPayments: [],
  },
};

export function usePaymentForm(preselectedOrderId?: string | null) {
  const [values, setValues] = useState<PaymentFormValues>(initialValues);
  const [errors, setErrors] = useState<string[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const hydratedOrderId = useRef<string | null>(null);
  const createMutation = useCreatePayment();

  const ordersQuery = useQuery({
    queryKey: ["orders", "payment-options"],
    queryFn: async () => {
      const response = await getOrders();
      return response.data.map(mapOrderResponseToPaymentOption);
    },
  });
  const preselectedQuery = useQuery({
    queryKey: ["order", preselectedOrderId],
    enabled: Boolean(preselectedOrderId),
    queryFn: async () => {
      const response = await getOrderById(preselectedOrderId as string);
      return mapOrderResponseToPaymentOption(response.data);
    },
  });
  const selectedOrderQuery = useQuery({
    queryKey: ["order", values.orderId],
    enabled: Boolean(values.orderId),
    queryFn: async () => {
      const response = await getOrderById(values.orderId);
      return mapOrderResponseToPaymentOption(response.data);
    },
  });

  const orders = useMemo(() => {
    const list = ordersQuery.data ?? [];
    if (
      preselectedQuery.data &&
      !list.some((order) => order.id === preselectedQuery.data?.id)
    ) {
      return [preselectedQuery.data, ...list];
    }
    return list;
  }, [ordersQuery.data, preselectedQuery.data]);

  useEffect(() => {
    if (!preselectedQuery.data || values.orderId) return;
    selectOrder(preselectedQuery.data);
  }, [preselectedQuery.data, values.orderId]);

  const selectedOrder =
    selectedOrderQuery.data ??
    orders.find((order) => order.id === values.orderId) ??
    null;

  useEffect(() => {
    const order = selectedOrderQuery.data;
    if (!order || hydratedOrderId.current === order.id) return;
    hydratedOrderId.current = order.id;
    const suggestedAmount = moneyString(order.remainingBalance);
    const scheduledPayments = generateInstallments(
      suggestedAmount,
      values.paymentPlan.totalInstallments,
      values.paymentPlan.startDate,
    );
    setValues((current) => ({
      ...current,
      amount:
        current.type === "INSTALLMENTS"
          ? scheduledPayments[0]?.dueAmount ?? ""
          : suggestedAmount,
      paymentPlan: {
        ...current.paymentPlan,
        totalAmount: suggestedAmount,
        scheduledPayments,
      },
    }));
  }, [
    selectedOrderQuery.data,
    values.paymentPlan.startDate,
    values.paymentPlan.totalInstallments,
  ]);

  const filteredOrders = useMemo(() => {
    const query = normalizePaymentSearch(orderSearch);
    if (!query) return orders;
    return orders.filter((order) =>
      normalizePaymentSearch(
        `${order.code} ${order.clientName} ${order.clientEmail ?? ""}`,
      ).includes(query),
    );
  }, [orderSearch, orders]);

  function updateValue<K extends keyof PaymentFormValues>(
    key: K,
    value: PaymentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors([]);
  }

  function selectOrder(order: PaymentOrderOption) {
    hydratedOrderId.current = null;
    const suggestedAmount = moneyString(order.remainingBalance);
    setValues((current) => ({
      ...current,
      orderId: order.id,
      amount: suggestedAmount,
      paymentPlan: {
        ...current.paymentPlan,
        totalAmount: suggestedAmount,
        scheduledPayments: generateInstallments(
          suggestedAmount,
          current.paymentPlan.totalInstallments,
          current.paymentPlan.startDate,
        ),
      },
    }));
    setErrors([]);
  }

  function regenerateInstallments(
    totalAmount = values.paymentPlan.totalAmount,
    count = values.paymentPlan.totalInstallments,
    startDate = values.paymentPlan.startDate,
  ) {
    const scheduledPayments = generateInstallments(totalAmount, count, startDate);
    setValues((current) => ({
      ...current,
      amount: scheduledPayments[0]?.dueAmount ?? current.amount,
      paymentPlan: {
        ...current.paymentPlan,
        totalAmount,
        totalInstallments: count,
        startDate,
        scheduledPayments,
      },
    }));
    setErrors([]);
  }

  function setPaymentType(type: PaymentType) {
    if (type === "FULL") {
      setValues((current) => ({
        ...current,
        type,
        amount: moneyString(selectedOrder?.remainingBalance ?? 0),
      }));
      return;
    }
    const totalAmount =
      values.paymentPlan.totalAmount ||
      moneyString(selectedOrder?.remainingBalance ?? 0);
    const scheduledPayments = generateInstallments(
      totalAmount,
      values.paymentPlan.totalInstallments,
      values.paymentPlan.startDate,
    );
    setValues((current) => ({
      ...current,
      type,
      amount: scheduledPayments[0]?.dueAmount ?? "",
      paymentPlan: {
        ...current.paymentPlan,
        totalAmount,
        scheduledPayments,
      },
    }));
    setErrors([]);
  }

  function updateInstallment(
    index: number,
    patch: Partial<ScheduledPaymentFormValue>,
  ) {
    setValues((current) => ({
      ...current,
      paymentPlan: {
        ...current.paymentPlan,
        scheduledPayments: current.paymentPlan.scheduledPayments.map(
          (installment, currentIndex) =>
            currentIndex === index
              ? { ...installment, ...patch }
              : installment,
        ),
      },
    }));
    setErrors([]);
  }

  function submit() {
    const validationErrors = validatePaymentForm(
      values,
      selectedOrder?.remainingBalance ?? 0,
    );
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }
    createMutation.mutate(mapPaymentFormToCreatePayload(values));
  }

  return {
    values,
    errors,
    orderSearch,
    orders: filteredOrders,
    selectedOrder,
    isLoadingOrders:
      ordersQuery.isLoading ||
      preselectedQuery.isLoading ||
      selectedOrderQuery.isFetching,
    isSubmitting: createMutation.isPending,
    setOrderSearch,
    updateValue,
    setPaymentType,
    selectOrder,
    regenerateInstallments,
    updateInstallment,
    submit,
  };
}
