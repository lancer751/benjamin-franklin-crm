import { useState, useEffect } from "react";
import { Plus, GraduationCap, MoreVertical, Loader2 } from "lucide-react";
import EditionPricingForm from "@/orders/components/ProductFormModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct } from "../services/productService";
import { getCourseEditions } from "@/academic/services/courseService";
import { useSearchStore } from "@/store/useSearchStore";
import { Badge } from "@/core/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";

const ProductsView = () => {
  const [showForm, setShowForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);  
  // 🧠 Estados para la alerta de eliminación
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Pedimos acceso al motor que está en main.tsx
  const { searchQuery, setPlaceholder, setSearchQuery } = useSearchStore();

  useEffect(() => {
    setPlaceholder("Buscar por ID de edición o categoría...");
    return () => setSearchQuery("");
  }, [setPlaceholder, setSearchQuery]);

  // 1. Usamos React Query para conectar con Hono RPC
  const { data: productsRes, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // 2. Traemos las ediciones (para cruzar los nombres)
  const { data: editionsRes } = useQuery({
    queryKey: ["editions"],
    queryFn: getCourseEditions,
  });

  const products = Array.isArray(productsRes) ? productsRes : [];
  const editions = Array.isArray(editionsRes) ? editionsRes : ((editionsRes as any)?.data || []);

  // 🚀 MUTACIÓN PARA ELIMINAR (DELETE)
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Refresca la tabla al instante
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

  // 1. Productos Activos (Los que están publicados o en venta)
  const activeProductsCount = products.filter(
    (p: any) => p.sales_status === "ON_SALE" || p.sales_status === "PUBLISHED"
  ).length;

  // 2. Ediciones Únicas (¿A cuántas ediciones distintas les hemos puesto precio?)
  const uniqueEditionsCount = new Set(products.map((p: any) => p.edition_id)).size;

  // 3. Precio Promedio del Catálogo
  const averagePrice = products.length > 0 
    ? products.reduce((acc: number, p: any) => acc + Number(p.cash_price || 0), 0) / products.length 
    : 0;

  // 4. Total Inscritos
  const totalInscritos = 0;

  const filteredProducts = products.filter((p: any) => {
    const query = (searchQuery || "").toLowerCase();
    const matchCategory = (p.category || "").toLowerCase().includes(query);
    const matchEditionId = (p.edition_id || "").toLowerCase().includes(query);
    return matchCategory || matchEditionId;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ON_SALE":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">ON_SALE</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">DRAFT</Badge>;
      case "PUBLISHED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">PUBLISHED</Badge>;
      case "COMPLETED":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">COMPLETED</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status || "UNKNOWN"}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => `S/ ${Number(amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  
  // 🧠 Busca el nombre del curso basado en el edition_id del producto
  const getCourseName = (editionId: string) => {
    if (!editions.length) return "Cargando curso...";
    const edition = editions.find((ed: any) => ed.id === editionId);
    return edition?.course?.name || "Curso Desconocido";
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo de Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona cursos, ediciones y precios del ecosistema académico.</p>
        </div>
        <button 
          onClick={() => {
            setProductToEdit(null); // Limpiamos cualquier edición previa
            setShowForm(true);
          }} 
          className="btn-primary"
        >
          <Plus size={18} /> Nuevo Producto
      </button>
      </div>

      {/* --- STATS DINÁMICOS --- */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Productos Activos</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {isLoading ? <Loader2 size={24} className="animate-spin text-muted-foreground" /> : activeProductsCount}
          </p>
        </div>
        
        <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ediciones con Precio</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {isLoading ? <Loader2 size={24} className="animate-spin text-muted-foreground" /> : uniqueEditionsCount}
          </p>
        </div>
        
        <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Inscritos</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {isLoading ? "-" : totalInscritos}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Requiere módulo de ventas</p>
        </div>
        
        <div className="rounded-xl bg-card border border-border p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Precio Promedio</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {isLoading ? "-" : `S/ ${averagePrice.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
        </div>
      </div>

      {/* --- TABLE CON ESTADOS DE CARGA Y ERROR --- */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">Todos los Productos</h2>
        </div>

        {/* MANEJO DE ESTADOS DE REACT QUERY */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Cargando productos desde la base de datos...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive">
            <p className="font-bold">Error al conectar con el servidor.</p>
            <p className="text-sm mt-2">Asegúrate de que el backend (Hono) esté corriendo.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mb-4 opacity-20" />
            <p>{searchQuery ? "No se encontraron productos coincidentes." : "No hay productos registrados. Haz clic en 'Nuevo Producto' para empezar."}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Producto</th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Precio Base</th>
                <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p: any) => (
                  <tr 
                    key={p.id} 
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/productos/${p.id}`)}
                  >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <GraduationCap size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground truncate max-w-[250px]" title={getCourseName(p.edition_id)}>
                          {getCourseName(p.edition_id)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] uppercase h-5">
                            {p.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono" title={`Edición ID: ${p.edition_id}`}>
                            {p.edition_id?.substring(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    <div className="flex flex-col">
                      <span>{formatCurrency(p.cash_price || 0)}</span>
                      {p.discount_price && (
                        <span className="text-[11px] text-muted-foreground line-through font-normal">
                          {formatCurrency(p.discount_price)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(p.sales_status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          onClick={(e) => e.stopPropagation()} // 👈 Evita navegar al detalle al abrir menú
                        >
                          <MoreVertical size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          // 🧠 PASAMOS LOS DATOS DE LA FILA AL ESTADO Y ABRIMOS EL MODAL
                          setProductToEdit(p); 
                          setShowForm(true);
                        }}>
                          Edición Rápida
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                          onClick={(e) => {
                            e.stopPropagation(); // 👈 Evita navegar al detalle al hacer clic en eliminar
                            setProductToDelete(p);
                            setShowDeleteAlert(true);
                          }}
                        >
                          Eliminar Producto
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- FORMULARIO DE CREACIÓN / EDICIÓN RÁPIDA --- */}
      <EditionPricingForm 
        // 🧠 EL TRUCO EXPERTO: Cambiar la 'key' obliga a React a reiniciar el componente.
        // Así evitamos que se queden pegados los datos del producto anterior.
        key={productToEdit ? productToEdit.id : 'new-product-form'} 
        open={showForm} 
        initialData={productToEdit} // Le pasamos la data
        onClose={() => {
          setShowForm(false);
          // Retrasamos un poquito la limpieza para que no se vea feo mientras hace la animación de cierre
          setTimeout(() => setProductToEdit(null), 200); 
        }}
      />

      {/* --- ALERTA DE ELIMINACIÓN --- */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar el producto de la categoría <b className="uppercase">{productToDelete?.category}</b> 
              {" "} asociado a la edición <b className="font-mono">{productToDelete?.edition_id?.substring(0, 8)}</b>. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => productToDelete?.id && deleteMutation.mutate(productToDelete.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar producto"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductsView;