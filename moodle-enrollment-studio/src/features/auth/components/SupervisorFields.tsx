import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Switch } from "@/core/components/ui/switch";

interface SupervisorFieldsProps {
  isVisible: boolean;
}

export function SupervisorFields({ isVisible }: SupervisorFieldsProps) {
  const { control } = useFormContext();

  return (
    <div 
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isVisible ? "opacity-100 max-h-[800px] mt-4" : "opacity-0 max-h-0 m-0"
      }`}
    >
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <span>👑</span> Datos de Supervisor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormField
            control={control}
            name="sales_supervisor_profile.team_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Equipo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Ventas Norte" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="sales_supervisor_profile.max_sellers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Límite Vendedores</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="sales_supervisor_profile.discount_limit_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Límite Descuento (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" min="0" max="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Permisos de Supervisor</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="sales_supervisor_profile.can_assign_leads"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Asignar Leads</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="sales_supervisor_profile.can_approve_discounts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Aprobar Descuentos</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="sales_supervisor_profile.can_reassign_leads"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Reasignar Leads</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="sales_supervisor_profile.can_cancel_orders"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Cancelar Órdenes</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="sales_supervisor_profile.can_view_all_team_sales"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background sm:col-span-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Ver Ventas de Todo el Equipo</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
