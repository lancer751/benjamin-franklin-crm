import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone, DollarSign, Loader2 } from "lucide-react";
import { CreateCampaignSchema, type CreateCampaignInput } from "shared";
import { createCampaign } from "../services/campaignService";
import { getProducts } from "@/features/products/services/productService";
import { getSupervisors } from "@/features/users/services/userService";
import { CampaignStatusMap, CampaignPlatformMap } from "@/core/utils/dictionaries";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/core/components/ui/toggle-group";
import { Switch } from "@/core/components/ui/switch";
import { Skeleton } from "@/core/components/ui/skeleton";
import { cn } from "@/core/lib/utils";

interface CampaignFormModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CampaignFormModal({ open, onClose }: CampaignFormModalProps) {
  const queryClient = useQueryClient();

  // 1. Cargar Productos Comerciales Reales
  const { data: productsRes, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: open,
  });

  const productOptions = Array.isArray(productsRes) ? productsRes : [];

  const validProducts = productOptions.filter(
    (product: any) => product.sales_status === "PUBLISHED" || product.sales_status === "ON_SALE"
  );

  // 2. Cargar Supervisores de Ventas Reales
  const { data: supervisorsRes, isLoading: isLoadingSupervisors } = useQuery({
    queryKey: ["supervisors"],
    queryFn: getSupervisors,
    enabled: open,
  });

  const supervisors = supervisorsRes?.success ? supervisorsRes.data : [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCampaignInput>({
    resolver: zodResolver(CreateCampaignSchema),
    defaultValues: {
      campaing_name: "",
      initial_budget: 0,
      start_date: undefined,
      end_date: null,
      platform: "FACEBOOK",
      is_organic: false,
      status: "ACTIVE",
      product_id: "",
      supervisor_id: "",
      meta_form_id: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      toast.success("Campaña creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      onClose();
      reset();
    },
    onError: (err) => {
      console.error(err);
      toast.error("Hubo un error al crear la campaña.");
    },
  });

  const onSubmit = (data: CreateCampaignInput) => {
    mutation.mutate(data);
  };

  const isPending = mutation.isPending;
  const isLoadingData = isLoadingProducts || isLoadingSupervisors;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        onClose();
        reset();
      }
    }}>
      <DialogContent className="sm:max-w-[650px] w-full p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-card">
        {/* Header con degradado sutil */}
        <div className="bg-gradient-to-r from-primary/5 via-transparent to-transparent p-6 border-b border-border">
          <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">Crear Nueva Campaña</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Ingresa los datos comerciales de la campaña para su gestión y asignación local.
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {isLoadingData ? (
              /* Skeletons de carga */
              <div className="space-y-5 py-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ) : (
              /* Inputs de Formulario reales */
              <div className="space-y-5">
                {/* Fila 1: Nombre de la Campaña */}
                <div className="space-y-1.5 col-span-full">
                  <Label htmlFor="campaing_name" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                    Nombre de la Campaña <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="campaing_name"
                    placeholder="Ej. Campaña Meta Ads - Cursos de Verano 2026"
                    className={cn("h-10", errors.campaing_name && "border-destructive focus-visible:ring-destructive")}
                    {...register("campaing_name")}
                    disabled={isPending}
                  />
                  {errors.campaing_name && (
                    <p className="text-xs text-destructive mt-1">
                      El nombre de la campaña es requerido y debe tener al menos 3 caracteres.
                    </p>
                  )}
                </div>

                {/* Fila 2: Producto Relacionado y Supervisor Responsable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Producto Relacionado <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="product_id"
                      render={({ field }) => (
                         <Select 
                            onValueChange={field.onChange} 
                            value={field.value || undefined} 
                            disabled={isPending || validProducts.length === 0}
                          >
                            <SelectTrigger className={cn("h-10", errors.product_id && "border-destructive focus:ring-destructive")}>
                              <SelectValue placeholder={validProducts.length === 0 ? "No hay productos publicados disponibles para campañas" : "Seleccione un producto..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {validProducts.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No hay productos publicados disponibles para campañas
                                </SelectItem>
                              ) : (
                                validProducts.map((p: any) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                      )}
                    />
                    {errors.product_id && (
                      <p className="text-xs text-destructive mt-1">Seleccione un producto de catálogo válido.</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Supervisor Responsable <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="supervisor_id"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || undefined} disabled={isPending}>
                          <SelectTrigger className={cn("h-10", errors.supervisor_id && "border-destructive focus:ring-destructive")}>
                            <SelectValue placeholder="Seleccione un supervisor..." />
                          </SelectTrigger>
                          <SelectContent>
                            {supervisors.map((s: any) => {
                              const fullName = s.user 
                                ? `${s.user.first_name} ${s.user.last_name}`.trim() 
                                : `Supervisor ${s.id.slice(0, 4)}`;
                              return (
                                <SelectItem key={s.id} value={s.id}>
                                  {fullName}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.supervisor_id && (
                      <p className="text-xs text-destructive mt-1">Seleccione un supervisor responsable.</p>
                    )}
                  </div>
                </div>

                {/* Fila 3: Plataforma y Presupuesto Inicial */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Plataforma Origen <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="platform"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seleccionar plataforma..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CampaignPlatformMap).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="initial_budget" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Presupuesto Inicial ($ USD) <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        <DollarSign className="h-4 w-4" />
                      </span>
                      <Input
                        id="initial_budget"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={cn("h-10 pl-8", errors.initial_budget && "border-destructive focus-visible:ring-destructive")}
                        {...register("initial_budget", {
                          setValueAs: (v) => (v === "" ? undefined : Number(v)),
                        })}
                        disabled={isPending}
                      />
                    </div>
                    {errors.initial_budget && (
                      <p className="text-xs text-destructive mt-1">
                        Debe ingresar un monto numérico positivo y mayor a cero.
                      </p>
                    )}
                  </div>
                </div>

                {/* Fila 4: Fecha de Inicio y Fecha de Fin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="start_date" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Fecha de Inicio <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      className={cn("h-10", errors.start_date && "border-destructive focus-visible:ring-destructive")}
                      {...register("start_date", {
                        setValueAs: (v) => (v === "" ? undefined : v),
                      })}
                      disabled={isPending}
                    />
                    {errors.start_date && (
                      <p className="text-xs text-destructive mt-1">Seleccione una fecha de inicio válida.</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="end_date" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Fecha de Fin <span className="text-muted-foreground">(Opcional)</span>
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      className={cn("h-10", errors.end_date && "border-destructive focus-visible:ring-destructive")}
                      {...register("end_date", {
                        setValueAs: (v) => (v === "" ? null : v),
                      })}
                      disabled={isPending}
                    />
                    {errors.end_date && (
                      <p className="text-xs text-destructive mt-1">
                        La fecha de finalización debe ser estrictamente posterior a la fecha de inicio.
                      </p>
                    )}
                  </div>
                </div>

                {/* Fila 5: ID de Formulario de Meta */}
                <div className="space-y-1.5">
                  <Label htmlFor="meta_form_id" className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                    ID Formulario de Meta (Opcional)
                  </Label>
                  <Input
                    id="meta_form_id"
                    placeholder="Ej. 840127475719166"
                    className="h-10"
                    {...register("meta_form_id", {
                      setValueAs: (v) => (v === "" ? null : v),
                    })}
                    disabled={isPending}
                  />
                </div>

                {/* Fila 6: Estado de Campaña y Tráfico Orgánico */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                      Estado de la Campaña
                    </Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <ToggleGroup
                          type="single"
                          value={field.value}
                          onValueChange={(val) => {
                            if (val) field.onChange(val);
                          }}
                          disabled={isPending}
                          className="justify-start gap-2"
                        >
                          {Object.entries(CampaignStatusMap).map(([key, value]) => (
                            <ToggleGroupItem
                              key={key}
                              value={key}
                              className={cn(
                                "h-9 px-3 text-xs border border-border rounded-lg",
                                key === "ACTIVE" && "data-[state=checked]:bg-emerald-50 data-[state=checked]:text-emerald-700 dark:data-[state=checked]:bg-emerald-950/20 dark:data-[state=checked]:text-emerald-400 border-emerald-250",
                                key === "PAUSED" && "data-[state=checked]:bg-amber-50 data-[state=checked]:text-amber-700 dark:data-[state=checked]:bg-amber-950/20 dark:data-[state=checked]:text-amber-400 border-amber-250",
                                key === "INACTIVE" && "data-[state=checked]:bg-slate-100 data-[state=checked]:text-slate-700 dark:data-[state=checked]:bg-slate-800 dark:data-[state=checked]:text-slate-300"
                              )}
                            >
                              {value.toUpperCase()}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/40 h-16 mt-2 md:mt-0">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tráfico Orgánico</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Define si proviene de búsqueda natural.</span>
                    </div>
                    <Controller
                      control={control}
                      name="is_organic"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer del Modal */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/50 rounded-b-2xl border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                reset();
              }}
              disabled={isPending || isLoadingData}
              className="h-9 px-4 rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isLoadingData}
              className="h-9 px-5 rounded-xl text-xs flex items-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Guardando..." : "Crear Campaña"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
