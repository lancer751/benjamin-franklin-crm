# Últimos cambios en el backend

Fecha: 2026-08-04

## Resumen general
Se agregaron cambios importantes en la lógica de órdenes, campañas, leads y pagos, además de un nuevo archivo de ejemplos de bodies JSON para facilitar las pruebas de endpoints.

## Archivos nuevos o actualizados
- `backend/API_ENDPOINT_BODY_EXAMPLES.md` (nuevo)
- `backend/seed-data-bodies.json` (corrección de nueva línea final)
- `backend/src/repositories/lead.repository.ts`
- `backend/src/repositories/order.repository.ts`
- `backend/src/routes/campaing/campaing.route.ts`
- `backend/src/routes/lead/lead.route.ts`
- `backend/src/routes/orders/order.route.ts`
- `backend/src/routes/orders/handlers/order.handler.ts`
- `backend/src/routes/payments/payment.route.ts`
- `backend/src/routes/users/sellers/sellers.route.ts`
- `backend/src/routes/campaing/members.route.ts` (archivo vacío creado)
- `backend/src/routes/campaing/sellers.route.ts` (archivo vacío creado)

## Detalles por funcionalidad

### 1) Ejemplos de bodies para endpoints
- `backend/API_ENDPOINT_BODY_EXAMPLES.md` contiene ejemplos JSON para múltiples endpoints del backend.
- Incluye ejemplos para autenticación, usuarios, académicos y más.
- Úsalo como referencia al probar la API con herramientas como Postman o Insomnia.

### 2) Lead repository: filtros mejorados y datos enriquecidos
- Se agregó soporte para filtros `from_date` y `to_date` en `leadRepository.findMany`.
- Ahora la búsqueda admite búsqueda por teléfono además de email/nombres.
- Los leads devueltos incluyen un flag `assignedToCampaign` que indica si el lead está asignado a una campaña.
- En `findById`, los leads incluyen ahora `orders` con `orderDetails`.
- Se renombró `findMembersByMember` a `findManyMembers` y se agregó `findMembersOnCampaign` para obtener miembros filtrando por campaña.

#### Cómo usarlo
- Filtrar leads por rango de fechas: enviar `from_date` y/o `to_date` en la consulta.
- Buscar leads por teléfono: usar `search` con un número de teléfono parcial o completo.

### 3) Rutas de campaña
- `backend/src/routes/campaing/campaing.route.ts` ahora importa `CampaignMemberQuerySchema` y `leadRepository`.
- Se añadieron comentarios y estructura para rutas de gestión de vendedores de campaña.
- Hay un bloque comentado para una futura ruta `GET /campaigns/:id/members` usando `findManyMembers`.

### 4) Actualización en `lead.route.ts`
- Se cambió el uso de `repo.findMembersByMember` a `repo.findMembersOnCampaign`, que es la nueva implementación para obtener miembros de una campaña específica.

### 5) Ordenes: creación, actualización y cancelación
- `backend/src/routes/orders/order.route.ts` ahora aplica autenticación y roles con `verifyUserAccessAuth` y `verifyUserRoleAccess`.
- Se incluye endpoint `GET /orders/:id` para recuperar una orden por ID.
- `POST /orders` ahora usa `member_id` en lugar de `lead_id` y valida que el `campaignMember` exista y esté en estado `MATRICULADO`.
- `PUT /orders/:id` puede actualizar:
  - `order_items` via `updateOrderItems`
  - `assigned_to` vía `orderRepository.updateAssignment`
  - `order_status` vía `orderRepository.updateStatus`
- `DELETE /orders/:id` cancela la orden con acceso restringido a roles `ADMIN` y `SALES_SUPERVISOR`.

#### Reglas nuevas de orden
- Un `SALES_REP` solo puede crear órdenes si él es el vendedor asignado.
- El `assigned_to` puede resolverse automáticamente para vendedores o verificarse si el usuario objetivo está activo.

### 6) Handler de órdenes: lógica de precios y descuentos
- `backend/src/routes/orders/handlers/order.handler.ts` mejoró la validación de códigos de descuento:
  - comprueba activación, expiración, producto asociado y límite de usos.
- Se corrigió la lógica de modalidades de asistencia:
  - `HIBRIDO` requiere modos de asistencia explícitos `VIRTUAL`/`PRESENCIAL`.
  - `ASINCRONICO` solo permite pagos al contado.
- Se actualizó el cálculo de precios:
  - `enrollment_fee` se excluye correctamente para el descuento máximo.
  - ahora el `discountCodeId` se guarda como ID en lugar de solo el código.
- Se agregó `generateUniqueOrderCode` para crear códigos únicos de orden.
- Se agregó `updateOrderItems` para re-preciar una orden existente y evitar cambios cuando ya existen planes de pago.

### 7) Repositorio de órdenes: datos y validaciones avanzadas
- `backend/src/repositories/order.repository.ts` agregó un `orderInclude` enriquecido con:
  - detalles del producto y categorías
  - datos del miembro y lead asociado
  - creador de la orden y usuario asignado
- `findMany` ahora admite `member_id` en la consulta.
- `findById` devuelve la orden con conteos de `payments` y `orderDetails`.
- `updateStatus` valida que:
  - no se complete una orden con saldo pendiente
  - no se cancele una orden con pagos confirmados
- `updateAssignment` valida usuario existente e activo.
- `cancel` delega en `updateStatus` con estado `CANCELLED`.

### 8) Pagos: relación de orden actualizada
- `backend/src/routes/payments/payment.route.ts` ahora incluye `member` en lugar de `lead` dentro de `payment.order`.
- Esto alinea la referencia de pago con la nueva estructura de órdenes basada en miembros.

### 9) Vendedores: métricas adicionales
- `backend/src/routes/users/sellers/sellers.route.ts` añadió conteos en la respuesta del perfil de vendedor:
  - `assignedOrders`
  - `campaignMembers`

## Notas adicionales
- Existen dos archivos nuevos vacíos en rutas de campañas:
  - `backend/src/routes/campaing/members.route.ts`
  - `backend/src/routes/campaing/sellers.route.ts`
- Estos archivos parecen creados como placeholders para futuras rutas de campaña.

## Recomendaciones de uso
- Apoyarse en `backend/API_ENDPOINT_BODY_EXAMPLES.md` al probar los endpoints.
- Para cambios de orden con artículos, usar `PUT /orders/:id` solo si la orden no tiene cronograma de pagos asociado.
- No generar órdenes para un campaign member que no esté `MATRICULADO`.
- Al consultar leads, usar los nuevos filtros de fecha y búsqueda por teléfono para resultados más precisos.
