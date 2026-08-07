# Benjamin CRM / Moodle Enrollment Manager

## Overview

This monorepo contains a CRM and enrollment platform for managing leads, campaigns, products, orders, payments, academic editions, and storefront content. It combines a backend API with modern web apps for marketing, operations, and student enrollment workflows.

### Included apps

- Backend API built with Bun, Hono, Prisma, Zod, and TypeScript
- Commercial website built with Astro for public-facing content and product discovery
- Management dashboard built with React + Vite for internal operations
- Moodle enrollment studio built with React + Vite for enrollment workflows and UI orchestration
- Shared packages for types, schemas, utilities, and the database layer

## Main capabilities

- Authentication and role-aware access for sales, marketing, supervisors, and admins
- Lead capture, campaign assignment, member tracking, interactions, and tasks
- Product and pricing management with edition-aware rules
- Order and payment creation, including installment plans
- Academic course, edition, schedule, slot, and professor management
- CMS content management for benefits, certifications, FAQs, and commercial content
- Meta leadgen webhook ingestion for marketing automation

## Typical project workflow

A common business flow for this platform looks like this:

1. Create or manage an academic course and its editions.
2. Create a product linked to an edition and define pricing.
3. Create a campaign and assign sellers or supervisors.
4. Capture a lead and add it to a campaign.
5. Log interactions and create tasks for follow-up.
6. Create an order for a qualified lead.
7. Register one or more payments, including installment plans when needed.
8. Publish or expose the product through the storefront and CMS content.

## Tech stack

- Runtime: Bun
- API framework: Hono
- Database ORM: Prisma
- Validation: Zod
- UI: React, Astro, Vite, Tailwind CSS
- Monorepo orchestration: Turbo

## Repository structure

```text
backend/                # Hono API and business logic
commercial-website/     # Astro storefront and marketing site
management-dashboard/   # React admin dashboard
moodle-enrollment-studio/ # React enrollment experience UI
packages/               # Internal packages such as the database layer
shared/                 # Shared types, schemas, and utilities
```

## Getting started

### Prerequisites

- Bun 1.2+
- Node.js 22+
- A PostgreSQL-compatible database for the Prisma setup

### Install dependencies

```bash
bun install
```

### Run the full workspace

```bash
bun run dev
```

This starts the apps through Turbo. You can also run them individually:

```bash
bun run dev:server
bun run dev:client
```

### Build the workspace

```bash
bun run build
```

## Backend API overview

The backend is mounted under `/api`.

### Health checks

- `GET /` — basic status response
- `GET /health` — health check including database connectivity

### Core route groups

- Authentication: `/api/auth`
- Users and profiles: `/api/users`
- Leads and campaign members: `/api/leads` and `/api/campaigns/:campaignId/members`
- Campaigns: `/api/campaigns`
- Products and categories: `/api/products`
- Orders: `/api/orders`
- Payments: `/api/payments`
- Academic courses, editions, and professors: `/api/academic`
- Storefront content: `/api/storefront`
- CMS content: `/api/cms`
- Meta webhooks: `/api/webhooks/meta/leadgen`

## Authentication examples

### Login

Endpoint:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@example.com",
  "password": "SuperSecret1"
}
```

### Current user

```http
GET /api/auth/me
```

## Lead workflow example

### Create a lead

Endpoint:

```http
POST /api/leads
```

Body:

```json
{
  "first_name": "María",
  "last_name": "López",
  "email": "maria@example.com",
  "profession": "Diseñadora",
  "gender": "FEMALE",
  "lead_status": "ACTIVE",
  "phones": [
    {
      "number": "912345678",
      "type": "WHATSAPP",
      "isPrincipal": true
    }
  ]
}
```

### Create a campaign member

Endpoint:

```http
POST /api/campaigns/:campaignId/members
```

Body:

```json
{
  "lead_id": "11111111-1111-1111-1111-111111111111",
  "campaing_id": "22222222-2222-2222-2222-222222222222",
  "assigned_to": "33333333-3333-3333-3333-333333333333",
  "source": "WHATSAPP",
  "is_primary": true
}
```

### Add an interaction or task

```http
POST /api/campaigns/:campaignId/members/:memberId/interactions
```

Body:

```json
{
  "notes": "Prospect responded to the WhatsApp follow-up and requested more information.",
  "type": "WHATSAPP"
}
```

```http
POST /api/campaigns/:campaignId/members/:memberId/tasks
```

Body:

```json
{
  "title": "Call lead",
  "content": "Confirm the course schedule and availability.",
  "is_done": false,
  "due_date": "2026-07-25"
}
```

## Campaign example

Endpoint:

```http
POST /api/campaigns
```

Body:

```json
{
  "name": "Summer Funnel",
  "initial_budget": 1500,
  "start_date": "2026-07-01",
  "end_date": "2026-09-30",
  "platform": "FACEBOOK",
  "is_organic": false,
  "status": "INACTIVE",
  "product_id": "44444444-4444-4444-4444-444444444444",
  "supervisor_id": "55555555-5555-5555-5555-555555555555",
  "seller_ids": [
    "66666666-6666-6666-6666-666666666666",
    "77777777-7777-7777-7777-777777777777"
  ],
  "meta_form_id": "form-123"
}
```

## Product example

Endpoint:

```http
POST /api/products
```

Body:

```json
{
  "name": "Digital Marketing Bootcamp",
  "edition_id": "88888888-8888-8888-8888-888888888888",
  "category_id": "99999999-9999-9999-9999-999999999999",
  "presale_price": 1200,
  "discount_price": 1000,
  "discount_expires_at": "2026-08-01",
  "installments_max_number": 6,
  "installments_min_number": 1,
  "prices": [
    {
      "attendance_mode": "HEREDADO",
      "price": 1000,
      "currency": "PEN"
    }
  ]
}
```

> Note: For hybrid editions, the API expects exactly two prices: one `VIRTUAL` and one `PRESENCIAL`. For non-hybrid editions, it expects a single `HEREDADO` price.

## Order example

Endpoint:

```http
POST /api/orders
```

Body:

```json
{
  "member_id": "11111111-1111-1111-1111-111111111111",
  "related_campaign": "22222222-2222-2222-2222-222222222222",
  "assigned_to": "33333333-3333-3333-3333-333333333333",
  "order_items": [
    {
      "product_id": "44444444-4444-4444-4444-444444444444",
      "attendance_mode": "HEREDADO",
      "payment_modality": "FULL",
      "discount_code": "BF2026"
    }
  ]
}
```

> Nota: las órdenes ahora se crean sobre un `member_id` de campaña y su `related_campaign`, no sobre `lead_id`. Además, el backend valida que el miembro esté en estado `MATRICULADO` y solo permite a un `SALES_REP` crear órdenes para su propio miembro.

## Payment example

Endpoint:

```http
POST /api/payments
```

Body:

```json
{
  "order_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "payment_date": "2026-07-18T15:30:00Z",
  "amount": "300.00",
  "payment_method": "ONLINE",
  "currency": "PEN",
  "transaccion_id": "TXN123456789",
  "payment_receipt": "uploads/payments/receipt-12345.pdf",
  "target": {
    "type": "SCHEDULED_INSTALLMENT",
    "scheduled_payment_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
  }
}
```

> Nota: el backend registra pagos como `PENDING` y luego actualiza su estado con `PATCH /api/payments/:id/status`. Para pagos de cuotas programadas se usa `target.type = "SCHEDULED_INSTALLMENT"`; para pago único de un ítem asincrónico se usa `target.type = "FULL_CASH"`.

## Implementación en moodle-enrollment-studio

### Ordenes
- El cliente debe enviar `member_id`, `related_campaign`, `assigned_to` y `order_items` en el payload de creación de orden.
- Cada item de `order_items` debe incluir `product_id`, `attendance_mode`, `payment_modality` y opcionalmente `discount_code`.
- El esquema de validación en `moodle-enrollment-studio/src/features/orders/schemas/orderFormSchema.ts` ya valida:
  - sólo `HEREDADO` para productos no híbridos
  - sólo `VIRTUAL`/`PRESENCIAL` para productos híbridos
  - `INSTALLMENTS` sólo cuando el producto admite cuota
  - el descuento no supera el subtotal
- El mapeo real se realiza en `moodle-enrollment-studio/src/features/orders/services/orderMappers.ts` con `mapCreateFormToPayload` y `mapUpdateFormToPayload`.
- Para actualizar órdenes, el cliente envía sólo los campos cambiados: `order_items`, `assigned_to` y/o `order_status`.
- Si la orden ya tiene un cronograma de pagos, el backend rechazará cambios en `order_items` y el cliente debe mostrar el mensaje de error apropiado.

### Pagos
- El cliente debe crear pagos con `POST /api/payments` usando el payload esperado por `CreatePaymentSchema`.
- En `moodle-enrollment-studio/src/features/payments/services/paymentMappers.ts`, `mapPaymentFormToCreatePayload` construye:
  - `payment_date` como ISO
  - `amount` como string decimal
  - `currency` en mayúsculas
  - `payment_receipt` como clave de almacenamiento
  - `target` con `SCHEDULED_INSTALLMENT` o `FULL_CASH`
- El hook `moodle-enrollment-studio/src/features/payments/hooks/usePaymentForm.ts` precarga la orden seleccionada y calcula el saldo restante.
- Para pagos en cuotas, `generateInstallments` crea `scheduled_payments` y el payload se envía al backend como parte de `payment_plan`.
- El backend crea el pago en estado `PENDING`; luego el estado se actualiza con `PATCH /api/payments/:id/status`.

### Archivos clave
- `moodle-enrollment-studio/src/features/orders/services/orderService.ts`
- `moodle-enrollment-studio/src/features/orders/services/orderMappers.ts`
- `moodle-enrollment-studio/src/features/orders/schemas/orderFormSchema.ts`
- `moodle-enrollment-studio/src/features/payments/services/paymentService.ts`
- `moodle-enrollment-studio/src/features/payments/services/paymentMappers.ts`
- `moodle-enrollment-studio/src/features/payments/hooks/usePaymentForm.ts`

## Academic edition example

Endpoint:

```http
POST /api/academic/courses/editions
```

Body:

```json
{
  "course_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "modality": "HIBRIDO",
  "edition_status": "SCHEDULED",
  "edition_number": 1,
  "edition_code": "2026-01",
  "start_date": "2026-08-01",
  "end_date": "2026-10-31",
  "assignOnlyActiveProfessors": true,
  "assigned_professors": [
    {
      "professor_id": "cccccccc-cccc-cccc-cccc-cccccccccccc"
    }
  ],
  "schedules": [
    {
      "day_of_week": "MONDAY",
      "type": "CLASS",
      "slots": [
        {
          "start_time": "19:00",
          "end_time": "21:00"
        }
      ]
    }
  ]
}
```

## Storefront and CMS

### Storefront products

```http
GET /api/storefront/products
```

### CMS content

Examples:

```http
GET /api/cms/products/commercial-content
GET /api/cms/benefits
GET /api/cms/certifications
GET /api/cms/faqs
```

## Environment configuration

Create the environment file used by the backend before starting it, for example in the backend folder or at the workspace root depending on your local setup. Configure the database connection and any secrets needed for authentication, webhooks, and external integrations.

## Development notes

- The workspace uses shared packages and a generated database client.
- The backend and frontends are designed to work together as a unified platform rather than as isolated apps.
- If you update Prisma models, regenerate and apply migrations from the database package workflow used by the repo.

## Status

The project now includes a multi-app architecture with a CRM backend, marketing website, management dashboard, and enrollment studio, making it suitable for end-to-end course and lead management workflows.
