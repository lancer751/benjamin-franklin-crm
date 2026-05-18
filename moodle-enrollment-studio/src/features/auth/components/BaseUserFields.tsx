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

interface BaseUserFieldsProps {
  roles: any[];
  loadingRoles: boolean;
  isEditMode: boolean;
}

export function BaseUserFields({ roles, loadingRoles, isEditMode }: BaseUserFieldsProps) {
  const { control } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Input placeholder="+1234567890" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="role_id"
        render={({ field }) => (
          <FormItem>
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

      <FormField
        control={control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm md:col-span-2">
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
