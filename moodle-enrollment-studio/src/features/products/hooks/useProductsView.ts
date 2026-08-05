import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "../services/productService";
import { useSearchStore } from "@/store/useSearchStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { BackendProductResponse } from "../types/product.types";

type ProductCatalogFilterItem = Pick<BackendProductResponse, "name" | "category">;

export const filterProductCatalog = <TProduct extends ProductCatalogFilterItem>(
  products: readonly TProduct[],
  searchQuery: string,
  selectedCategoryId: string,
): TProduct[] => {
  const normalizedSearchQuery = searchQuery.toLowerCase();

  return products.filter(
    (product) =>
      (!selectedCategoryId || product.category?.id === selectedCategoryId) &&
      product.name.toLowerCase().includes(normalizedSearchQuery),
  );
};

export const useProductsView = () => {
  const [showForm, setShowForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<BackendProductResponse | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [productToDelete, setProductToDelete] = useState<BackendProductResponse | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { searchQuery, setPlaceholder, setSearchQuery } = useSearchStore();

  useEffect(() => {
    setPlaceholder("Buscar productos por nombre o categoría...");
    return () => setSearchQuery("");
  }, [setPlaceholder, setSearchQuery]);

  const { data: productsRes, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const products = useMemo<BackendProductResponse[]>(
    () => (Array.isArray(productsRes) ? productsRes : []),
    [productsRes],
  );

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Producto eliminado exitosamente");
      setShowDeleteAlert(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error al eliminar el producto. Puede tener ventas asociadas.");
      setShowDeleteAlert(false);
    }
  });

  const stats = useMemo(() => {
    const activeProductsCount = products.filter(
      (product) => product.sales_status === "ON_SALE" || product.sales_status === "PUBLISHED"
    ).length;

    const uniqueEditionsCount = new Set(products.map((product) => product.edition?.id)).size;

    const totalInscritos = 0; // Requiere módulo de ventas

    const averagePrice = products.length > 0
      ? products.reduce((acc, product) => acc + Number(product.prices?.[0]?.cash_price || 0), 0) / products.length
      : 0;

    return {
      activeProductsCount,
      uniqueEditionsCount,
      totalInscritos,
      averagePrice
    };
  }, [products]);

  const productsInSelectedCategory = useMemo(
    () =>
      selectedCategoryId
        ? products.filter((product) => product.category?.id === selectedCategoryId)
        : products,
    [products, selectedCategoryId],
  );

  const filteredProducts = useMemo(
    () => filterProductCatalog(products, searchQuery || "", selectedCategoryId),
    [products, searchQuery, selectedCategoryId],
  );

  const handleEdit = (product: BackendProductResponse) => {
    setProductToEdit(product);
    setShowForm(true);
  };

  const handleDeleteRequest = (product: BackendProductResponse) => {
    setProductToDelete(product);
    setShowDeleteAlert(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setTimeout(() => setProductToEdit(null), 200);
  };

  return {
    products: filteredProducts,
    isLoading,
    isError,
    stats,
    searchQuery,
    selectedCategoryId,
    isCategoryEmpty: Boolean(selectedCategoryId) && productsInSelectedCategory.length === 0,
    actions: {
      navigate,
      setSelectedCategoryId,
      handleEdit,
      handleDeleteRequest,
      confirmDelete: () => productToDelete?.id && deleteMutation.mutate(productToDelete.id),
    },
    modals: {
      showForm,
      setShowForm,
      productToEdit,
      showDeleteAlert,
      setShowDeleteAlert,
      productToDelete,
      closeForm,
      isDeleting: deleteMutation.isPending
    }
  };
};
