import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CalendarDays, DollarSign, Info, Loader2, Megaphone, Users } from "lucide-react";
import { toast } from "sonner";
import { CreateCampaignSchema, type CreateCampaignInput } from "shared";
import { assignSellersToCampaign, createCampaign, updateCampaign } from "../services/campaignService";
import { getMetaCampaigns, getMetaForms } from "../services/metaCampaignService";
import { getProducts } from "@/features/products/services/productService";
import { getSellers, getSupervisors } from "@/features/users/services/userService";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Switch } from "@/core/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/core/components/ui/toggle-group";
import { cn } from "@/core/lib/utils";
import {
  CampaignAcquisitionChannel,
  type AcquisitionChannel,
} from "./CampaignAcquisitionChannel";
import { MultiSellerSelect, type SellerOption } from "./MultiSellerSelect";
import { SearchableCombobox, type ComboboxOption } from "./SearchableCombobox";

interface CampaignFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: any;
}

interface CampaignFormValues {
  name: string;
  initial_budget: number;
  start_date: string;
  end_date: string | null;
  platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "WEBSITE";
  is_organic: boolean;
  status: "ACTIVE" | "INACTIVE" | "PAUSED";
  product_id: string;
  supervisor_id: string;
  seller_ids: string[];
  meta_campaign_id: string | null;
  meta_form_id: string | null;
  click_to_whatsapp: boolean;
  whatsapp_number: string | null;
}

const platformOptions = [
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "WEBSITE", label: "Sitio web" },
] as const;

const statusOptions = [
  { value: "ACTIVE", label: "ACTIVA" },
  { value: "PAUSED", label: "PAUSADA" },
  { value: "INACTIVE", label: "INACTIVA" },
] as const;

const defaultValues: CampaignFormValues = {
  name: "",
  initial_budget: 0,
  start_date: "",
  end_date: null,
  platform: "FACEBOOK",
  is_organic: false,
  status: "INACTIVE",
  product_id: "",
  supervisor_id: "",
  seller_ids: [],
  meta_campaign_id: null,
  meta_form_id: null,
  click_to_whatsapp: false,
  whatsapp_number: null,
};

const dateInputValue = (value?: string | Date | null) =>
  value ? new Date(value).toISOString().split("T")[0] : "";

const fullName = (profile: any, fallback: string) => {
  const user = profile?.user;
  const name = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  return name || fallback;
};

const getInitialSellerIds = (data: any): string[] =>
  (data?.seller_ids || data?.sellersOnCampaign || [])
    .map((item: any) => (typeof item === "string" ? item : item.seller_id || item.seller?.id))
    .filter(Boolean);

const getInitialChannel = (data: any): AcquisitionChannel => {
  if (data?.click_to_whatsapp) return "WHATSAPP";
  if (data?.meta_form_id) return "META_FORM";
  return "NONE";
};

const SectionTitle = ({ children }: { children: string }) => (
  <div className="flex items-center gap-2">
    <span className="h-5 w-1 rounded-full bg-primary" />
    <h3 className="text-xs font-bold tracking-[0.14em] text-slate-700">{children}</h3>
  </div>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive">{message}</p> : null;

export default function CampaignForm({ onCancel, onSuccess, initialData }: CampaignFormProps) {
  const isEdit = Boolean(initialData?.id);
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState<AcquisitionChannel>("NONE");

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(CreateCampaignSchema) as any,
    mode: "onChange",
    defaultValues,
  });

  const values = watch();
  const supportsMeta = values.platform === "FACEBOOK" || values.platform === "INSTAGRAM";
  const initialSellerIds = useMemo(() => getInitialSellerIds(initialData), [initialData]);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: true,
  });
  const supervisorsQuery = useQuery({
    queryKey: ["supervisors"],
    queryFn: getSupervisors,
    enabled: true,
  });
  const sellersQuery = useQuery({
    queryKey: ["sellers"],
    queryFn: getSellers,
    enabled: true,
  });
  const metaCampaignsQuery = useQuery({
    queryKey: ["meta-campaigns"],
    queryFn: getMetaCampaigns,
    enabled: channel === "META_FORM" && supportsMeta,
  });
  const metaFormsQuery = useQuery({
    queryKey: ["meta-forms", values.meta_campaign_id],
    queryFn: () => getMetaForms(values.meta_campaign_id!),
    enabled: channel === "META_FORM" && supportsMeta && Boolean(values.meta_campaign_id),
  });

  const validProducts = useMemo(() => {
    const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];
    return products.filter(
      (product: any) => product.sales_status === "ON_SALE" && product.pricing_status === "VALID",
    );
  }, [productsQuery.data]);

  const productOptions: ComboboxOption[] = useMemo(
    () =>
      validProducts.map((product: any) => {
        const cashPrices = (product.prices || [])
          .map((price: any) => Number(price.cash_price))
          .filter((price: number) => Number.isFinite(price) && price > 0);
        const minimumPrice = cashPrices.length ? Math.min(...cashPrices) : null;
        const details = [
          product.edition?.modality,
          product.edition?.edition_number ? `Edición ${product.edition.edition_number}` : null,
          "En venta",
          minimumPrice !== null ? `Desde $ ${minimumPrice.toFixed(2)}` : null,
        ].filter(Boolean);

        return {
          value: product.id,
          label: product.name,
          searchText: `${product.edition?.modality || ""} ${product.edition?.edition_number || ""}`,
          description: details.join(" · "),
        };
      }),
    [validProducts],
  );

  const supervisors = supervisorsQuery.data?.success ? supervisorsQuery.data.data : [];
  const supervisorOptions: ComboboxOption[] = (supervisors || []).map((supervisor: any) => ({
    value: supervisor.id,
    label: fullName(supervisor, `Supervisor ${supervisor.id.slice(0, 6)}`),
    searchText: supervisor.user?.email || "",
    description: supervisor.user?.email || undefined,
  }));

  const sellers = sellersQuery.data?.success ? sellersQuery.data.data : [];
  const sellerOptions: SellerOption[] = (sellers || []).map((seller: any) => ({
    id: seller.id,
    name: fullName(seller, `Vendedor ${seller.id.slice(0, 6)}`),
    email: seller.user?.email || undefined,
  }));

  const metaCampaignOptions: ComboboxOption[] = (metaCampaignsQuery.data || []).map((campaign) => ({
    value: campaign.id,
    label: campaign.name,
    searchText: `${campaign.status} ${campaign.objective || ""}`,
    description: [campaign.status, campaign.objective].filter(Boolean).join(" · "),
  }));
  const metaFormOptions: ComboboxOption[] = (metaFormsQuery.data || []).map((form) => ({
    value: form.id,
    label: form.name,
    searchText: form.status,
    description: form.status,
  }));

  useEffect(() => {
    if (isEdit) {
      const initialChannel = getInitialChannel(initialData);
      setChannel(initialChannel);
      reset({
        name: initialData.name || initialData.campaing_name || "",
        initial_budget: Number(initialData.initial_budget || 0),
        start_date: dateInputValue(initialData.start_date),
        end_date: dateInputValue(initialData.end_date) || null,
        platform: initialData.platform || "FACEBOOK",
        is_organic: Boolean(initialData.is_organic),
        status: initialData.status || "INACTIVE",
        product_id: initialData.product_id || initialData.product?.id || initialData.relatedProduct?.id || "",
        supervisor_id: initialData.supervisor_id || initialData.assignedSupervisor?.id || "",
        seller_ids: getInitialSellerIds(initialData),
        meta_campaign_id: initialData.meta_campaign_id || null,
        meta_form_id: initialData.meta_form_id || null,
        click_to_whatsapp: Boolean(initialData.click_to_whatsapp),
        whatsapp_number: initialData.whatsapp_number || null,
      });
    } else {
      setChannel("NONE");
      reset(defaultValues);
    }
  }, [initialData, isEdit, reset]);

  useEffect(() => {
    if (!supportsMeta && channel !== "NONE") {
      setChannel("NONE");
      setValue("meta_campaign_id", null, { shouldValidate: true });
      setValue("meta_form_id", null, { shouldValidate: true });
      setValue("click_to_whatsapp", false, { shouldValidate: true });
      setValue("whatsapp_number", null, { shouldValidate: true });
    }
  }, [channel, setValue, supportsMeta]);

  useEffect(() => {
    if (values.end_date && values.start_date && values.end_date < values.start_date) {
      setError("end_date", { type: "validate", message: "La fecha de fin no puede ser anterior a la fecha de inicio." });
    } else if (errors.end_date?.type === "validate") {
      clearErrors("end_date");
    }
  }, [clearErrors, errors.end_date?.type, setError, values.end_date, values.start_date]);

  const changeChannel = (nextChannel: AcquisitionChannel) => {
    setChannel(nextChannel);
    const isWhatsApp = nextChannel === "WHATSAPP";
    setValue("click_to_whatsapp", isWhatsApp, { shouldValidate: true });

    if (nextChannel !== "META_FORM") {
      setValue("meta_campaign_id", null, { shouldValidate: true });
      setValue("meta_form_id", null, { shouldValidate: true });
    }
    if (!isWhatsApp) {
      setValue("whatsapp_number", null, { shouldValidate: true });
    }
  };

  const mutation = useMutation({
    mutationFn: async (formValues: CampaignFormValues) => {
      const parsed = CreateCampaignSchema.parse({
        ...formValues,
        status: isEdit ? formValues.status : "INACTIVE",
        end_date: formValues.end_date || null,
        meta_campaign_id: channel === "META_FORM" ? formValues.meta_campaign_id : null,
        meta_form_id: channel === "META_FORM" ? formValues.meta_form_id : null,
        click_to_whatsapp: channel === "WHATSAPP",
        whatsapp_number: channel === "WHATSAPP" ? formValues.whatsapp_number : null,
      }) as CreateCampaignInput;

      if (!isEdit) return createCampaign(parsed);

      const updateResult = await updateCampaign(initialData.id, {
        campaing_name: parsed.name,
        initial_budget: parsed.initial_budget,
        start_date: parsed.start_date,
        end_date: parsed.end_date,
        platform: parsed.platform,
        is_organic: parsed.is_organic,
        status: parsed.status,
        product_id: parsed.product_id,
        supervisor_id: parsed.supervisor_id,
        meta_form_id: parsed.meta_form_id,
      });

      const sellersToAdd = parsed.seller_ids.filter((sellerId) => !initialSellerIds.includes(sellerId));
      if (sellersToAdd.length > 0) {
        await assignSellersToCampaign(initialData.id, { seller_ids: sellersToAdd });
      }

      return updateResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", initialData?.id] });
      toast.success(isEdit ? "Campaña actualizada exitosamente" : "Campaña creada exitosamente");
      reset(defaultValues);
      setChannel("NONE");
      onSuccess();
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error?.message || (isEdit ? "No se pudo actualizar la campaña" : "No se pudo crear la campaña"));
    },
  });

  const whatsappValid = /^9\d{8}$/.test(values.whatsapp_number || "");
  const dateRangeInvalid = Boolean(values.end_date && values.start_date && values.end_date < values.start_date);
  const requiredChecks = [
    { valid: values.name?.trim().length > 0, label: "nombre" },
    { valid: Boolean(values.product_id), label: "producto" },
    { valid: Boolean(values.supervisor_id), label: "supervisor" },
    { valid: values.seller_ids?.length > 0, label: "vendedores" },
    { valid: Number(values.initial_budget) > 0, label: "presupuesto" },
    { valid: Boolean(values.start_date), label: "fecha de inicio" },
    { valid: channel !== "META_FORM" || Boolean(values.meta_form_id), label: "formulario Meta" },
    { valid: channel !== "WHATSAPP" || whatsappValid, label: "WhatsApp" },
  ];
  const missingFields = requiredChecks.filter((check) => !check.valid).map((check) => check.label);
  const requiredQueryError = productsQuery.isError || supervisorsQuery.isError || sellersQuery.isError;
  const metaQueryError = channel === "META_FORM" && (metaCampaignsQuery.isError || metaFormsQuery.isError);
  const submitDisabled =
    mutation.isPending ||
    missingFields.length > 0 ||
    dateRangeInvalid ||
    Object.keys(errors).length > 0 ||
    requiredQueryError ||
    metaQueryError;

  const onInvalidSubmit = () => toast.error("Revisa los campos marcados antes de continuar.");
  const selectedProduct = productOptions.find((option) => option.value === values.product_id)?.label || "Sin seleccionar";
  const selectedSupervisor = supervisorOptions.find((option) => option.value === values.supervisor_id)?.label || "Sin seleccionar";
  const selectedSellers = sellerOptions.filter((seller) => values.seller_ids?.includes(seller.id));
  const platformLabel = platformOptions.find((platform) => platform.value === values.platform)?.label || "Sin seleccionar";
  const channelLabel = channel === "META_FORM"
    ? "Formulario instantáneo de Meta"
    : channel === "WHATSAPP"
      ? "Click-to-WhatsApp"
      : "Sin integración externa";

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data), onInvalidSubmit)}>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 sm:p-7">
              <section className="space-y-5" aria-label="Información general">
                <SectionTitle>INFORMACIÓN GENERAL</SectionTitle>

                <div className="space-y-1.5">
                  <Label htmlFor="campaign-name">Nombre de la campaña <span className="text-destructive">*</span></Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ej. Campaña Meta Ads – Cursos de verano 2026"
                    disabled={mutation.isPending}
                    className={cn(errors.name && "border-destructive")}
                    {...register("name")}
                  />
                  <FieldError message={errors.name ? "Ingresa el nombre de la campaña." : undefined} />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Producto relacionado <span className="text-destructive">*</span></Label>
                    <Controller
                      control={control}
                      name="product_id"
                      render={({ field }) => (
                        <SearchableCombobox
                          value={field.value}
                          options={productOptions}
                          placeholder={validProducts.length ? "Buscar un producto disponible..." : "No hay productos disponibles para venta"}
                          searchPlaceholder="Buscar producto..."
                          emptyMessage="No hay productos disponibles para venta"
                          loading={productsQuery.isLoading}
                          error={productsQuery.isError}
                          disabled={mutation.isPending || validProducts.length === 0}
                          onRetry={() => productsQuery.refetch()}
                          onChange={field.onChange}
                          className={cn(errors.product_id && "border-destructive")}
                        />
                      )}
                    />
                    <p className="text-xs text-muted-foreground">Solo se muestran productos con estado En venta y precios válidos</p>
                    <FieldError message={errors.product_id ? "Selecciona un producto disponible para venta." : undefined} />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Supervisor responsable <span className="text-destructive">*</span></Label>
                    <Controller
                      control={control}
                      name="supervisor_id"
                      render={({ field }) => (
                        <SearchableCombobox
                          value={field.value}
                          options={supervisorOptions}
                          placeholder={supervisorOptions.length ? "Buscar supervisor..." : "No hay supervisores disponibles"}
                          searchPlaceholder="Buscar supervisor..."
                          emptyMessage="No se encontraron supervisores"
                          loading={supervisorsQuery.isLoading}
                          error={supervisorsQuery.isError}
                          disabled={mutation.isPending || supervisorOptions.length === 0}
                          onRetry={() => supervisorsQuery.refetch()}
                          onChange={field.onChange}
                          className={cn(errors.supervisor_id && "border-destructive")}
                        />
                      )}
                    />
                    <FieldError message={errors.supervisor_id ? "Selecciona un supervisor responsable." : undefined} />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Vendedores asignados <span className="text-destructive">*</span></Label>
                    <Controller
                      control={control}
                      name="seller_ids"
                      render={({ field }) => (
                        <MultiSellerSelect
                          options={sellerOptions}
                          value={field.value || []}
                          onChange={field.onChange}
                          loading={sellersQuery.isLoading}
                          error={sellersQuery.isError}
                          disabled={mutation.isPending}
                          lockedIds={isEdit ? initialSellerIds : []}
                          onRetry={() => sellersQuery.refetch()}
                        />
                      )}
                    />
                    {isEdit && <p className="text-xs text-muted-foreground">Puedes agregar vendedores. Las asignaciones existentes se retiran desde el detalle de la campaña.</p>}
                    <FieldError message={errors.seller_ids ? "Selecciona al menos un vendedor." : undefined} />
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 sm:p-7">
              <section className="space-y-5" aria-label="Configuración comercial">
                <SectionTitle>CONFIGURACIÓN COMERCIAL</SectionTitle>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Plataforma <span className="text-destructive">*</span></Label>
                    <Controller
                      control={control}
                      name="platform"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={mutation.isPending}>
                          <SelectTrigger><SelectValue placeholder="Selecciona una plataforma" /></SelectTrigger>
                          <SelectContent>
                            {platformOptions.map((platform) => <SelectItem key={platform.value} value={platform.value}>{platform.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="initial-budget">Presupuesto inicial (USD) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="initial-budget"
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="0.00"
                        disabled={mutation.isPending}
                        className={cn("pl-9", errors.initial_budget && "border-destructive")}
                        {...register("initial_budget", { setValueAs: (value) => (value === "" ? 0 : Number(value)) })}
                      />
                    </div>
                    <FieldError message={errors.initial_budget ? "El presupuesto debe ser mayor que cero." : undefined} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="start-date">Fecha de inicio <span className="text-destructive">*</span></Label>
                    <Input id="start-date" type="date" disabled={mutation.isPending} className={cn(errors.start_date && "border-destructive")} {...register("start_date")} />
                    <FieldError message={errors.start_date ? "Selecciona una fecha de inicio válida." : undefined} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="end-date">Fecha de fin <span className="font-normal text-muted-foreground">(Opcional)</span></Label>
                    <Input
                      id="end-date"
                      type="date"
                      min={values.start_date || undefined}
                      disabled={mutation.isPending}
                      className={cn(errors.end_date && "border-destructive")}
                      {...register("end_date", { setValueAs: (value) => value || null })}
                    />
                    <FieldError message={errors.end_date?.message} />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border bg-slate-50/60 p-4 md:col-span-2">
                    <div>
                      <Label htmlFor="organic-traffic" className="text-sm">Tráfico orgánico</Label>
                      <p className="mt-0.5 text-xs text-muted-foreground">Indica si la captación no utiliza inversión publicitaria.</p>
                    </div>
                    <Controller control={control} name="is_organic" render={({ field }) => (
                      <Switch id="organic-traffic" checked={field.value} onCheckedChange={field.onChange} disabled={mutation.isPending} />
                    )} />
                  </div>
                </div>

                {!isEdit ? (
                  <Alert className="border-primary/20 bg-primary/5 text-slate-700">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription>La campaña se creará como inactiva. Podrás activarla después de revisar la configuración</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <Label>Estado de la campaña</Label>
                    <Controller control={control} name="status" render={({ field }) => (
                      <ToggleGroup type="single" value={field.value} onValueChange={(value) => value && field.onChange(value)} className="justify-start gap-2">
                        {statusOptions.map((status) => (
                          <ToggleGroupItem key={status.value} value={status.value} className="rounded-lg border px-4 text-xs font-semibold data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary">
                            {status.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    )} />
                  </div>
                )}
              </section>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 sm:p-7">
              <section className="space-y-5" aria-label="Canal de captación">
                <SectionTitle>CANAL DE CAPTACIÓN</SectionTitle>
                <CampaignAcquisitionChannel
                  value={channel}
                  onChange={changeChannel}
                  platform={values.platform}
                  disabled={mutation.isPending || (isEdit && getInitialChannel(initialData) === "WHATSAPP")}
                  disabledValues={isEdit ? ["WHATSAPP"] : []}
                />
                {isEdit && (
                  <p className="text-xs text-muted-foreground">
                    El contrato de edición permite actualizar el formulario Meta, pero no la configuración Click-to-WhatsApp.
                  </p>
                )}

                {channel === "META_FORM" && supportsMeta && (
                  <div className="grid grid-cols-1 gap-5 rounded-xl border bg-slate-50/50 p-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Campaña de Meta <span className="text-destructive">*</span></Label>
                      <Controller control={control} name="meta_campaign_id" render={({ field }) => (
                        <SearchableCombobox
                          value={field.value}
                          options={metaCampaignOptions}
                          placeholder="Seleccionar campaña de Meta..."
                          searchPlaceholder="Buscar campaña..."
                          emptyMessage="No hay campañas de Meta disponibles"
                          loading={metaCampaignsQuery.isLoading}
                          error={metaCampaignsQuery.isError}
                          disabled={mutation.isPending}
                          onRetry={() => metaCampaignsQuery.refetch()}
                          onChange={(value) => {
                            field.onChange(value);
                            setValue("meta_form_id", null, { shouldValidate: true });
                          }}
                        />
                      )} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Formulario instantáneo <span className="text-destructive">*</span></Label>
                      <Controller control={control} name="meta_form_id" render={({ field }) => (
                        <SearchableCombobox
                          value={field.value}
                          options={metaFormOptions}
                          placeholder={values.meta_campaign_id ? "Seleccionar formulario..." : "Selecciona primero una campaña"}
                          searchPlaceholder="Buscar formulario..."
                          emptyMessage="No hay formularios disponibles para esta campaña"
                          loading={metaFormsQuery.isLoading}
                          error={metaFormsQuery.isError}
                          disabled={mutation.isPending || !values.meta_campaign_id}
                          onRetry={() => metaFormsQuery.refetch()}
                          onChange={field.onChange}
                          className={cn(errors.meta_form_id && "border-destructive")}
                        />
                      )} />
                      <FieldError message={errors.meta_form_id ? "Selecciona un formulario instantáneo." : undefined} />
                    </div>
                  </div>
                )}

                {channel === "WHATSAPP" && supportsMeta && (
                  <div className="max-w-md space-y-1.5 rounded-xl border bg-slate-50/50 p-4">
                    <Label htmlFor="whatsapp-number">Número de WhatsApp <span className="text-destructive">*</span></Label>
                    <div className="flex">
                      <span className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm font-medium text-muted-foreground">+51</span>
                      <Input
                        id="whatsapp-number"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={9}
                        placeholder="987654321"
                        disabled={mutation.isPending || isEdit}
                        className={cn("rounded-l-none", (errors.whatsapp_number || (values.whatsapp_number && !whatsappValid)) && "border-destructive")}
                        {...register("whatsapp_number", {
                          setValueAs: (value) => value?.replace(/\D/g, "").slice(0, 9) || null,
                          onChange: (event) => {
                            event.target.value = event.target.value.replace(/\D/g, "").slice(0, 9);
                          },
                        })}
                      />
                    </div>
                    {(errors.whatsapp_number || (values.whatsapp_number && !whatsappValid)) && (
                      <FieldError message="Ingresa 9 dígitos y asegúrate de que el número comience con 9." />
                    )}
                    <p className="text-xs text-muted-foreground">Se guardarán únicamente los 9 dígitos, sin el prefijo +51.</p>
                  </div>
                )}
              </section>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-6">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Resumen de campaña</h2>
                  <p className="text-xs text-muted-foreground">Revisa la configuración antes de guardar.</p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Estado</dt><dd className="text-right font-semibold">{isEdit ? values.status : "INACTIVA"}</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Producto</dt><dd className="max-w-[60%] text-right font-semibold">{selectedProduct}</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Supervisor</dt><dd className="max-w-[60%] text-right font-semibold">{selectedSupervisor}</dd></div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5" /> Vendedores</dt>
                  <dd className="text-right font-semibold">{selectedSellers.length || "Sin seleccionar"}</dd>
                </div>
                <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Plataforma</dt><dd className="text-right font-semibold">{platformLabel}</dd></div>
                <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Presupuesto</dt><dd className="text-right font-semibold">$ {Number(values.initial_budget || 0).toFixed(2)}</dd></div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="flex items-center gap-1.5 text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Fechas</dt>
                  <dd className="max-w-[60%] text-right font-semibold">{values.start_date || "Sin inicio"}{values.end_date ? ` → ${values.end_date}` : ""}</dd>
                </div>
                <div className="flex items-start justify-between gap-4"><dt className="text-muted-foreground">Canal</dt><dd className="max-w-[60%] text-right font-semibold">{channelLabel}</dd></div>
              </dl>

              {channel === "META_FORM" && (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-muted-foreground">
                  Formulario Meta: <span className="font-medium text-foreground">{metaFormOptions.find((form) => form.value === values.meta_form_id)?.label || "Pendiente"}</span>
                </div>
              )}
              {channel === "WHATSAPP" && (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-muted-foreground">
                  WhatsApp: <span className="font-medium text-foreground">{values.whatsapp_number ? `+51 ${values.whatsapp_number}` : "Pendiente"}</span>
                </div>
              )}

              <div className="rounded-xl border p-3 text-xs text-muted-foreground" aria-live="polite">
              {missingFields.length > 0 ? (
                <span className="flex items-start gap-1.5"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />Pendiente: {missingFields.join(", ")}.</span>
              ) : (
                <span className="text-emerald-600">Todos los campos obligatorios están completos.</span>
              )}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>Cancelar</Button>
                <Button type="submit" disabled={submitDisabled}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Guardar cambios" : "Crear campaña"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}
