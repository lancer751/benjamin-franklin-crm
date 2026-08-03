import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/categoryService";
import type {
  CategoryMutationVariables,
  CreateCategoryPayload,
  ProductCategory,
} from "../types/category.types";

export const CATEGORIES_QUERY_KEY = ["products", "categories"] as const;

const upsertCategory = (
  categories: ProductCategory[] | undefined,
  category: ProductCategory,
): ProductCategory[] => {
  const current = categories ?? [];
  const exists = current.some((item) => item.id === category.id);
  const next = exists
    ? current.map((item) => (item.id === category.id ? category : item))
    : [...current, category];
  return next.sort((left, right) => left.name.localeCompare(right.name, "es"));
};

export const useCategories = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: (category) => {
      queryClient.setQueryData<ProductCategory[]>(CATEGORIES_QUERY_KEY, (current) =>
        upsertCategory(current, category),
      );
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: CategoryMutationVariables) =>
      updateCategory(id, payload),
    onSuccess: (category) => {
      queryClient.setQueryData<ProductCategory[]>(CATEGORIES_QUERY_KEY, (current) =>
        upsertCategory(current, category),
      );
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (_response, id) => {
      queryClient.setQueryData<ProductCategory[]>(CATEGORIES_QUERY_KEY, (current) =>
        (current ?? []).filter((category) => category.id !== id),
      );
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    retry: query.refetch,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
