import { useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/core/components/ui/select";

interface SellerFieldsProps {
  supervisors: any[];
  loadingSupervisors: boolean;
  isVisible: boolean;
}

export function SellerFields({ supervisors, loadingSupervisors, isVisible }: SellerFieldsProps) {
  const { control } = useFormContext();

  return (
    <div 
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isVisible ? "opacity-100 max-h-[600px] mt-4" : "opacity-0 max-h-0 m-0"
      }`}
    >
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <span>📊</span> Datos de Vendedor
        </h3>

        {isVisible && !loadingSupervisors && supervisors.length === 0 && (
          <Alert variant="destructive" className="mb-4 bg-destructive/10 text-destructive border-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Debe registrar un supervisor antes de crear un vendedor.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="seller_profile.sales_target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta de Ventas ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="seller_profile.assigned_supervisor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supervisor Asignado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingSupervisors || supervisors.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSupervisors ? "Cargando..." : "Selecciona supervisor"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supervisors.map((sup: any) => (
                      <SelectItem key={sup.id} value={sup.id}>
                        {sup.user?.first_name} {sup.user?.last_name} {sup.team_name ? `(${sup.team_name})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
