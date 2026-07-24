import { useEffect, useMemo } from "react";
import {
  useFieldArray,
  useForm,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  buildOrderFormSchema,
  emptyOrderFormValues,
} from "../schemas/orderFormSchema";
import { calculateOrderPreview } from "../services/orderMappers";
import type { OrderFormValues, OrderProduct } from "../types";

interface UseOrderFormOptions {
  mode: "create" | "edit";
  initialValues?: OrderFormValues;
  products: OrderProduct[];
  itemsEditable: boolean;
}

export function useOrderForm({
  mode,
  initialValues,
  products,
  itemsEditable,
}: UseOrderFormOptions) {
  const schema = useMemo(
    () =>
      buildOrderFormSchema(products, {
        requireLead: mode === "create",
        requireItems: mode === "create" || itemsEditable,
      }),
    [itemsEditable, mode, products],
  );

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(schema) as Resolver<OrderFormValues>,
    defaultValues: initialValues ?? emptyOrderFormValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(initialValues ?? emptyOrderFormValues);
  }, [form, initialValues]);

  const fieldArray = useFieldArray({
    control: form.control,
    name: "order_items",
  });
  const values = form.watch();
  const preview = calculateOrderPreview(values, products);

  return {
    form,
    fields: fieldArray.fields,
    appendItem: () =>
      fieldArray.append({
        product_id: "",
        attendance_mode: "",
        discount_code: null,
      }),
    removeItem: fieldArray.remove,
    preview,
    canSubmit:
      !form.formState.isSubmitting &&
      (mode === "create" || form.formState.isDirty),
  };
}
