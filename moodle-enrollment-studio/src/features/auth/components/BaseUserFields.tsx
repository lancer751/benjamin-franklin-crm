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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/core/components/ui/select";
import { translateEnum, RoleTranslationsMap } from "@/core/utils/dictionaries";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Calendar } from "@/core/components/ui/calendar";
import { Button } from "@/core/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";

interface BaseUserFieldsProps {
  roles: any[];
  loadingRoles: boolean;
  isEditMode: boolean;
}

export function BaseUserFields({ roles, loadingRoles, isEditMode }: BaseUserFieldsProps) {
  const { control } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Fila de Nombres y Apellidos en 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
        <FormField
          control={control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Juan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="middle_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segundo Nombre (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Carlos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo Electrónico</FormLabel>
            <FormControl>
              <Input type="email" placeholder="correo@ejemplo.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isEditMode ? "Nueva Contraseña (Opcional)" : "Contraseña *"}</FormLabel>
            <FormControl>
              <Input type="password" placeholder="******" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="cellphone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Celular (Opcional)</FormLabel>
            <FormControl>
              <Input placeholder="999888777" {...field} value={field.value || ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Selector nativo de Fecha de Nacimiento con Popover + Calendar */}
      <FormField
        control={control}
        name="birth_date"
        render={({ field }) => (
          <FormItem className="flex flex-col justify-end">
            <FormLabel className="mb-2">Fecha de Nacimiento (Opcional)</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal rounded-xl h-11 border-slate-200 hover:bg-slate-50",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="role_id"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Rol de Usuario</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loadingRoles ? "Cargando roles..." : "Selecciona un rol"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {roles.map((role: any) => (
                  <SelectItem key={role.id} value={role.id}>
                    {translateEnum(role.name, RoleTranslationsMap)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sección Datos Corporativos */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-2">
        <h4 className="md:col-span-2 text-xs font-bold text-slate-800 uppercase tracking-wider">Datos Corporativos</h4>
        <FormField
          control={control}
          name="corporate_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Corporativo (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="correo.corp@empresa.com" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="corporate_cellphone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Celular Corporativo (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="999888777" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm md:col-span-2 mt-2">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Estado del Usuario
              </FormLabel>
              <div className="text-sm text-muted-foreground">
                Activa o inactiva el acceso de este usuario al sistema.
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
