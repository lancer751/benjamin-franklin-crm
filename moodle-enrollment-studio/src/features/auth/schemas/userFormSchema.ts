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
  
  // Campos de Vendedor (Sales Rep)
  seller_profile: z.object({
    sales_target: z.coerce.number().min(0, "La meta no puede ser negativa").optional(),
    assigned_supervisor_id: z.string().optional(),
  }).optional(),

  // Campos de Supervisor
  sales_supervisor_profile: z.object({
    team_name: z.string().optional(),
    max_sellers: z.coerce.number().min(0).optional(),
    discount_limit_percent: z.coerce.number().min(0).max(100).optional(),
    can_assign_leads: z.boolean().optional(),
    can_approve_discounts: z.boolean().optional(),
    can_reassign_leads: z.boolean().optional(),
    can_cancel_orders: z.boolean().optional(),
    can_view_all_team_sales: z.boolean().optional(),
  }).optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;