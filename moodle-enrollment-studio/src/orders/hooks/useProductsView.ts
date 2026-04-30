import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "../services/productService";
import { useSearchStore } from "@/store/useSearchStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useProductsView = () => {
  const [showForm, setShowForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

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

  const products = useMemo(() => Array.isArray(productsRes) ? productsRes : [], [productsRes]);

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
      (p: any) => p.sales_status === "ON_SALE" || p.sales_status === "PUBLISHED"
    ).length;

    const uniqueEditionsCount = new Set(products.map((p: any) => p.edition_id)).size;

    const totalInscritos = 0; // Requiere módulo de ventas

    const averagePrice = products.length > 0
      ? products.reduce((acc: number, p: any) => acc + Number(p.prices?.[0]?.cash_price || 0), 0) / products.length
      : 0;

    return {
      activeProductsCount,
      uniqueEditionsCount,
      totalInscritos,
      averagePrice
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = (searchQuery || "").toLowerCase();
    return products.filter((p: any) => {
      return (p.name || "").toLowerCase().includes(query);
    });
  }, [products, searchQuery]);

  const handleEdit = (product: any) => {
    setProductToEdit(product);
    setShowForm(true);
  };

  const handleDeleteRequest = (product: any) => {
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
    actions: {
      navigate,
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
