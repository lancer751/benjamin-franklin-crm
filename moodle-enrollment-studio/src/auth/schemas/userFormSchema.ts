import * as z from "zod";

export const userFormSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Por favor, ingresa un correo electrónico válido"),
  
  // Exige 6 caracteres, o permite que esté totalmente vacío
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")), 
    
  // Exige exactamente 9 números, o permite que esté totalmente vacío
  cellphone: z.string()
    .regex(/^\d{9}$/, "El celular debe tener exactamente 9 dígitos numéricos")
    .optional()
    .or(z.literal("")),
    
  role_id: z.string().min(1, "Debes seleccionar un rol para este usuario"),
  is_active: z.boolean().default(true),
  sales_target: z.coerce.number().min(0, "La meta no puede ser negativa").optional(),
  max_discount: z.coerce.number().min(0).max(100, "El descuento máximo es 100%").optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;