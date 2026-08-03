# Contexto del Proyecto: Benjamin Franklin CRM

Este documento proporciona una visión general y técnica de la arquitectura, componentes, convenciones y estado actual del monorepo **Benjamin Franklin CRM**.

---

## 1. Resumen del proyecto
**Benjamin Franklin CRM** es una solución interna de gestión de relaciones con clientes (CRM) y matriculación para la Corporación Educativa Benjamin Franklin. Resuelve el problema de captación, seguimiento e inscripción de prospectos (leads) interesados en los cursos y programas de la institución.

*   **Quién lo usa**: 
    *   **Administradores**: Supervisan todo el sistema, configuran campañas y gestionan usuarios.
    *   **Supervisores de Ventas**: Asignan leads a asesores, supervisan métricas del equipo y aprueban descuentos.
    *   **Asesores de Ventas (Sales Reps)**: Realizan el seguimiento diario de los leads asignados, registran interacciones y generan órdenes de venta.
    *   **Marketing**: Diseña campañas y hace seguimiento del retorno de inversión (ROI) e ingresos generados.

---

## 2. Arquitectura del monorepo
El proyecto utiliza un monorepo gestionado con **Bun (v1.2.4)** y orquestado mediante **Turborepo (v2.6.3)**.

### Estructura de Workspaces y Relaciones
```text
                       [ shared ] (Zod Schemas y Tipos)
                           ^
                           |
                           v
    [ packages/db ] ----> [ backend ] (Hono API)
         |                     ^
         |                     |
         +----------+----------+
                    |
                    v
       [ moodle-enrollment-studio ] (React Frontend Activo)
       [ management-dashboard ]    (React Frontend Dashboard)
       [ commercial-website ]      (Astro Landing Page Portal)
```

---

## 3. Apps y paquetes

### `backend`
*   **Propósito**: API REST centralizada que expone servicios para todas las plataformas front-end del CRM.
*   **Stack técnico**: Hono, TypeScript, Prisma (PostgreSQL adapter), Zod.
*   **Estado actual**: Activo / Estable.
*   **Comandos**: 
    *   Iniciar desarrollo: `bun run dev` (o desde la raíz: `bun run dev:server`)
    *   Compilar: `bun run build` (o desde la raíz: `bun run build:server`)

### `moodle-enrollment-studio`
*   **Propósito**: Panel interactivo enfocado en la matriculación y seguimiento de leads por campaña.
*   **Stack técnico**: React 19, Vite, TanStack Query (v5), Tailwind CSS (v3), Radix UI, Zustand, React Router DOM (v6).
*   **Estado actual**: En desarrollo activo (frontend principal del CRM en construcción).
*   **Comandos**:
    *   Iniciar desarrollo: `vite` (o desde la raíz: `bun run dev:client` o `bun run dev`)
    *   Compilar: `vite build` (o desde la raíz: `bun run build:client`)

### `management-dashboard`
*   **Propósito**: Panel administrativo general del CRM para visualización de métricas avanzadas y configuraciones globales.
*   **Stack técnico**: React 19, Vite, Tailwind CSS (v4), TanStack React Form.
*   **Estado actual**: Estable / Componentes iniciales.
*   **Comandos**:
    *   Iniciar desarrollo: `bun dev`

### `commercial-website`
*   **Propósito**: Sitio web comercial y portal de matrículas para los estudiantes.
*   **Stack técnico**: Astro (v7), Tailwind CSS (v4).
*   **Estado actual**: Estable / Placeholder comercial.
*   **Comandos**:
    *   Iniciar desarrollo: `bun run dev`

### `shared`
*   **Propósito**: Paquete interno que contiene los esquemas de validación Zod y tipos TypeScript comunes.
*   **Stack técnico**: TypeScript, Zod.
*   **Estado actual**: Activo / Estable.
*   **Comandos**:
    *   Compilar: `bun run build`
    *   Modo desarrollo: `bun run dev`

### `packages/db` (registrado como `@repo/database`)
*   **Propósito**: Capa de datos compartida y conector del ORM Prisma.
*   **Stack técnico**: Prisma ORM, PostgreSQL.
*   **Estado actual**: Estable / Activo.
*   **Comandos**:
    *   Generar cliente: `turbo run prisma:generate`

---

## 4. Backend en detalle

### Patrón de Capas
El backend sigue una arquitectura limpia estructurada de la siguiente manera:
$$\text{Ruta (Hono)} \longrightarrow \text{Validador (Zod)} \longrightarrow \text{Repositorio} \longrightarrow \text{Base de Datos (Prisma)}$$

*Ejemplo Simplificado:*
```typescript
// 1. Ruta (route) en lead.route.ts
.patch(
  "/reassign-bulk",
  verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"),
  zValidator("json", ReassignMultipleCampaignMembersSchema),
  async (c) => {
    // 2. Inyección y llamado al Repositorio
    const repo = leadRepository(c.get("prisma"));
    const updated = await repo.reassignMembersBeforeRemove(c.req.valid("json"));
    return c.json({ success: true, data: updated }, 200);
  }
)
```

### Convenciones del Backend
1.  **Inyección de base de datos**: Prisma se inyecta en cada solicitud a través de la propiedad de contexto de Hono (`c.get("prisma")`) mediante el middleware global `withPrisma`.
2.  **Respuestas uniformes**:
    *   Éxito: `c.json<SuccessResponse<T>>({ success: true, message: "...", data: T }, 200)`
    *   Error: Se lanzan mediante `HTTPException` o manejadores internos con códigos mapeados como `NOT_FOUND` (404), `CONFLICT` (409), etc.
3.  **Roles y Permisos**: Protegido a nivel de ruta mediante el middleware `verifyUserRoleAccess` (ej. `verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR")`).
4.  **Validación**: Todas las entradas del cliente (cuerpos JSON, parámetros de URL y de consulta) se validan estrictamente mediante el middleware `zValidator` de `@hono/zod-validator` con los esquemas compartidos en `shared`.

---

## 5. Modelo de datos
El archivo [schema.prisma](file:///c:/Users/Admin/Desktop/APLICACIONES/benjamin-franklin-crm/packages/db/prisma/schema.prisma) define las siguientes entidades y flujos principales:

*   **Flujo de Clientes y Leads**:
    *   `Lead`: Prospecto de cliente. Contiene datos personales y DNI. Se relaciona con `LeadPhone` y `CustomerProfile`.
    *   `CampaignMember`: Vincula un `Lead` con una `Campaing` específica y le asigna un `SellerProfile` (Asesor) encargado de gestionar su estado (`CampaignMemberStatus` como `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`).
    *   `LeadInteraction`: Notas históricas de las llamadas, WhatsApp, reuniones o correos que el asesor registra con el miembro de la campaña.
    *   `Tasks`: Tareas programadas asociadas a un lead y asignadas a un asesor para recordatorios de seguimiento.
*   **Estructura Académica**:
    *   `Course`: Cursos o programas académicos base.
    *   `Edition`: Programación física o virtual de un curso (ej. Edición 2026-I) con horarios (`EditionSchedule`) y profesores asignados.
    *   `Product`: Paquete comercializable de una `Edition` con precios detallados en `ProductPrice` según la modalidad (`VIRTUAL`, `PRESENCIAL`).
*   **Ventas y Cobros**:
    *   `Order` y `OrderDetail`: Orden generada al vender un `Product` a un `Lead`.
    *   `Payment` y `PaymentPlan`: Control de transacciones (pagos totales o en cuotas) y calendario de cobros pendientes (`ScheduledPayment`).

---

## 6. Frontend: moodle-enrollment-studio

### Stack y Componentes
*   **Enrutado**: `react-router-dom` con rutas dinámicas protegidas según el rol del usuario autenticado.
*   **Manejo de Estado**:
    *   **Servidor**: React Query (TanStack Query v5) para peticiones, caché e invalidaciones.
    *   **Cliente / UI**: Zustand para estados globales compartidos (ej. persistencia del token de sesión en `useAuthStore`).
*   **Cliente de API**: Utiliza el cliente RPC tipado de Hono (`hcWithType` importado de `backend`) para una comunicación síncrona y tipada en tiempo real.

### Estructura de Carpetas (`src/`)
*   `core/`: Componentes comunes de UI reutilizables (botones, diálogos, selectores), layouts globales, utilidades de red y el cliente de API base `src/core/lib/api.ts`.
*   `features/`: Módulos de dominio de la aplicación (ej. `campaigns`, `leads`, `payments`, `users`). Cada módulo agrupa:
    *   `components/`: Subcomponentes locales y formularios.
    *   `hooks/`: Custom hooks para abstracción de lógica y mutaciones (ej. `useCampaignDetail`).
    *   `services/`: Llamados a endpoints y APIs específicos del módulo.
    *   `views/`: Páginas completas del módulo.

---

## 7. Paquete shared
El paquete `shared` centraliza los esquemas Zod reutilizados en frontend y backend:
*   Importación de esquemas: `import { CreateLeadSchema, ReassignMultipleCampaignMembersSchema } from "shared"`
*   Inferencia de tipos: `export type CreateLeadInput = z.infer<typeof CreateLeadSchema>`

Evita que los desarrolladores dupliquen código de validación o redefinan tipos de TypeScript entre el cliente de React y el servidor Hono.

---

## 8. Convenciones generales
*   **Naming**: 
    *   Backend / Base de datos: `snake_case` para campos de tablas y nombres de relaciones.
    *   Frontend: `camelCase` para variables/funciones, `PascalCase` para componentes React y `kebab-case` para nombres de archivos no React.
*   **Estilos**: Tailwind CSS se utiliza para la maquetación. Se priorizan los tokens CSS centralizados en `index.css` de `core`.
*   **Manejo de Tokens y Autenticación**: Manejado mediante cookies HttpOnly transparentes en el cliente de API con renovación proactiva (`/auth/refresh-access-token`) al recibir respuestas `401 Unauthorized`.

---

## 9. Cosas pendientes o en progreso
*   **Backend**:
    *   [ ] Refactorizar el ruteo central en `backend/src/app.ts` (`// TODO: refactor this routing`).
    *   [ ] Manejo correcto de errores JWT en `auth.middleware.ts` (`//TODO: Handle JWT errors`).
    *   [ ] Mitigar problemas de exceso de peticiones concurrentes a la DB en `edition.route.ts` (líneas 97 y 223).
*   **Frontend**:
    *   [ ] Conectar la vista de pagos con el endpoint real de subida de comprobantes en `PaymentDetailView.tsx` (`// TODO: Conectar con endpoint de subida de archivos`).
*   **Modelo de Datos**:
    *   [ ] Vincular `StudyPlan` correctamente a la tabla de ediciones (`schema.prisma` línea 377).
    *   [ ] Implementar la entidad y flujos de FAQs (`schema.prisma` línea 585).

---

## 10. Última actualización
*Actualizado el 13 de julio de 2026*. Creación inicial del archivo `CONTEXT.md` documentando la arquitectura de workspaces, el stack tecnológico, el modelo de datos de Prisma y la convención de Hono/TanStack Query del CRM.
