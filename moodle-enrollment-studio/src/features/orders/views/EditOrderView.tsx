import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Pencil } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import { OrderForm } from "../components/OrderForm";
import { useOrder } from "../hooks/useOrder";
import { useUpdateOrder } from "../hooks/useUpdateOrder";
import {
  mapOrderToFormValues,
  mapUpdateFormToPayload,
} from "../services/orderMappers";
import {
  getOrderProducts,
  mapOrderApiError,
} from "../services/orderService";
import type { OrderFormValues } from "../types";
import { getSellers } from "@/features/users/services/userService";
import { adaptSellerOptions } from "@/features/leads/adapters/campaignAssignmentAdapter";
import { orderQueryKeys } from "../queryKeys";
import { sellerKeys } from "@/features/users/queryKeys";

export default function EditOrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderQuery = useOrder(id);
  const productsQuery = useQuery({
    queryKey: orderQueryKeys.products,
    queryFn: getOrderProducts,
  });
  const sellersQuery = useQuery({
    queryKey: sellerKeys.list(),
    queryFn: getSellers,
  });
  const mutation = useUpdateOrder(id ?? "");
  const order = orderQuery.data?.data;
  const mapped = useMemo(
    () => (order ? mapOrderToFormValues(order) : undefined),
    [order],
  );
  const assigneeOptions = useMemo(() => {
    const options = adaptSellerOptions(sellersQuery.data);
    const assignedUser = order?.assignedUser;
    if (!assignedUser || options.some((option) => option.userId === assignedUser.id)) {
      return options;
    }
    const currentName = [assignedUser.first_name, assignedUser.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || "Asesor actual";
    return [{ userId: assignedUser.id, sellerProfileId: "", name: currentName }, ...options];
  }, [order?.assignedUser, sellersQuery.data]);

  if (orderQuery.isLoading || productsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-[520px] w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!id || orderQuery.isError || !order || !mapped) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>La orden no existe</AlertTitle>
        <AlertDescription>
          No fue posible cargar la orden solicitada.
        </AlertDescription>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/ordenes")}
        >
          Volver al listado
        </Button>
      </Alert>
    );
  }

  if (productsQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No se pudieron cargar los productos</AlertTitle>
        <AlertDescription>
          La información de precios es necesaria para editar la orden.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = (values: OrderFormValues) => {
    const payload = mapUpdateFormToPayload(values, mapped.values);
    if (Object.keys(payload).length > 0) {
      mutation.mutate(payload);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Pencil className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar orden</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Orden {order.order_code}. Actualiza únicamente los datos permitidos.
          </p>
        </div>
      </header>

      <OrderForm
        mode="edit"
        initialValues={mapped.values}
        order={order}
        products={productsQuery.data ?? []}
        itemsEditable={mapped.canEditItems}
        limitation={mapped.limitation}
        assigneeOptions={assigneeOptions}
        assigneesLoading={sellersQuery.isLoading}
        isSubmitting={mutation.isPending}
        submitError={
          mutation.error ? mapOrderApiError(mutation.error) : undefined
        }
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/ordenes/${id}`)}
      />
    </div>
  );
}
