import { z } from "zod";

// 1. Definición nativa del formulario replicando la Unión Discriminada compartida
export const userFormSchema = z.discriminatedUnion("role", [
  z.object({
    id: z.string().optional(),
    role: z.literal("SALES_REP"),
    role_id: z.string().uuid("Selecciona un rol válido"), // 🌟 Inyectado directamente
    first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    middle_name: z.string().default(""),
    corporate_email: z.preprocess((val) => (val === "" ? null : val), z.string().email("Correo corporativo inválido").nullable().optional()),
    corporate_cellphone: z.preprocess((val) => (val === "" ? null : val), z.string().regex(/^\d{9}$/, "El celular corporativo debe tener 9 dígitos").nullable().optional()),
    birth_date: z.date().nullable().optional(),
    last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Por favor, ingresa un correo electrónico válido"),
    password: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional()
    ),
    cellphone: z.preprocess((val) => (val === "" ? null : val), z.string().regex(/^\d{9}$/, "El celular debe tener 9 dígitos").nullable().optional()),
    is_active: z.boolean().default(true),
    
    // Perfil de Vendedor obligatorio para este rol
    seller_profile: z.object({
      sales_target: z.coerce.number().min(0, "La meta no puede ser negativa").default(0),
      assigned_supervisor_id: z.string().min(1, "Debes asignar un supervisor"),
    }),
  }),

  z.object({
    id: z.string().optional(),
    role: z.literal("SALES_SUPERVISOR"),
    role_id: z.string().uuid("Selecciona un rol válido"),
    first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    middle_name: z.string().default(""),
    corporate_email: z.preprocess((val) => (val === "" ? null : val), z.string().email("Correo corporativo inválido").nullable().optional()),
    corporate_cellphone: z.preprocess((val) => (val === "" ? null : val), z.string().regex(/^\d{9}$/, "El celular corporativo debe tener 9 dígitos").nullable().optional()),
    birth_date: z.date().nullable().optional(),
    last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Por favor, ingresa un correo electrónico válido"),
    password: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional()
    ),
    cellphone: z.preprocess((val) => (val === "" ? null : val), z.string().regex(/^\d{9}$/, "El celular debe tener 9 dígitos").nullable().optional()),
    is_active: z.boolean().default(true),
    
    // 🌟 REPARADO: Forzamos la validación estricta del perfil para la UI
    sales_supervisor_profile: z.object({
      team_name: z.string().min(2, "El nombre del equipo es obligatorio"),
      max_sellers: z.coerce.number().min(1, "Debe tener al menos 1 vendedor").default(10),
      can_assign_leads: z.boolean().default(true),
      can_reassign_leads: z.boolean().default(true),
      can_approve_discounts: z.boolean().default(true),
      can_cancel_orders: z.boolean().default(true),
      can_view_all_team_sales: z.boolean().default(true),
      discount_limit_percent: z.string().default("10"),
    }),
  }),

  z.object({
    id: z.string().optional(),
    role: z.literal("ADMIN"),
    role_id: z.string().uuid("Selecciona un rol válido"),
    first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    middle_name: z.string().default(""),
    corporate_email: z.preprocess((val) => (val === "" ? null : val), z.string().email("Correo corporativo inválido").nullable().optional()),
    corporate_cellphone: z.preprocess((val) => (val === "" ? null : val), z.string().regex(/^\d{9}$/, "El celular corporativo debe tener 9 dígitos").nullable().optional()),
    birth_date: z.date().nullable().optional(),
    last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Por favor, ingresa un correo electrónico válido"),
    password: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional()
    ),
    cellphone: z.preprocess((val) => (val === "" ? null : val), z.string().regex(/^\d{9}$/, "El celular debe tener 9 dígitos").nullable().optional()),
    is_active: z.boolean().default(true),
  }),
]).refine(
  (data) => {
    // Si no hay ID (creación), la contraseña es estrictamente obligatoria (>= 6 caracteres)
    if (!data.id) {
      return data.password !== undefined && data.password.length >= 6;
    }
    // Si hay ID (edición), la contraseña es opcional (puede ser undefined o tener >= 6 caracteres si se provee)
    return true;
  },
  {
    message: "La contraseña debe tener al menos 6 caracteres",
    path: ["password"],
  }
);

export type UserFormValues = z.infer<typeof userFormSchema>;

export const defaultUserFormValues: UserFormValues = {
  id: "",
  role: "SALES_REP",
  role_id: "",
  first_name: "",
  middle_name: "",
  corporate_email: "",
  corporate_cellphone: "",
  birth_date: null,
  last_name: "",
  email: "",
  password: "",
  cellphone: "",
  is_active: true,
  seller_profile: {
    sales_target: 0,
    assigned_supervisor_id: "",
  },
} as any;