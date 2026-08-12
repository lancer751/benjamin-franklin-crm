import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";

interface SupervisorFieldsProps {
  isVisible: boolean;
}

export function SupervisorFields({ isVisible }: SupervisorFieldsProps) {
  const { control } = useFormContext();

  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isVisible ? "mt-4 max-h-64 opacity-100" : "m-0 max-h-0 opacity-0"
      }`}
    >
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true">👑</span> Datos de Supervisor
        </h3>
        <div className="max-w-sm">
          <FormField
            control={control}
            name="sales_supervisor_profile.max_sellers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Límite de vendedores</FormLabel>
                <FormControl>
                  <Input type="number" min={1} placeholder="10" {...field} />
                </FormControl>
                <FormDescription>
                  Número máximo de asesores que puede supervisar.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
