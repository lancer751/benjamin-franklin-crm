# Moodle Enrollment Manager

## Overview

This repository implements a CRM backend and content management API for managing leads, campaigns, course products, orders, payments, and academic editions. It is built with **Bun**, **Hono**, **Prisma**, and **Zod**.

The backend supports:
- User authentication and role-based access
- Seller, supervisor, and marketer profile management
- Campaign creation and seller assignment
- Lead creation, campaign membership, interactions, and task management
- Product creation with edition-aware pricing
- Order creation, update, and lifecycle protection
- Manual payments and installment plans
- Academic courses, editions, and professor management
- CMS content management for benefits, certifications, FAQs, and product marketing content
- Meta leadgen webhook ingestion

## Installation

```bash
bun install
```

## Run

```bash
bun run dev
```

## API Base

The backend exposes the API at `/api`.

Health endpoints:
- `GET /` — status check
- `GET /health` — database connectivity check

## Authentication

### `POST /api/auth/login`
Request body:
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

### `GET /api/auth/me`
Returns the authenticated user and profile IDs according to the user's role.

### `POST /api/auth/refresh-access-token`
Refreshes the access token using the refresh cookie.

### `POST /api/auth/logout`
Clears authentication cookies.

## Users

### `GET /api/users`
List all users.

### `GET /api/users/:id`
Get a single user by ID.

### `POST /api/users`
Create a user and role-specific profile.

Example payload:
```json
{
  "first_name": "Lucas",
  "last_name": "Diaz",
  "email": "lucas@example.com",
  "password": "SuperSecret1",
  "role": "SALES_REP",
  "role_id": "uuid-role-sales-rep",
  "seller_profile": {
    "assigned_supervisor_id": "uuid-supervisor",
    "sales_target": 10000
  }
}
```

### `PUT /api/users/:id`
Update user fields.

### `DELETE /api/users/:id`
Delete a user.

### `GET /api/users/roles`
List available roles.

### Seller profile routes
- `GET /api/users/sellers` — list seller profiles
- `GET /api/users/sellers/:id` — seller details by user ID
- `GET /api/users/sellers/:id/campaigns` — campaigns assigned to seller
- `PUT /api/users/sellers/:id` — update seller profile

### Supervisor routes
- `GET /api/users/sales-supervisors`
- `GET /api/users/sales-supervisors/:id`
- `PUT /api/users/sales-supervisors/:id`

### Marketers
- `GET /api/users/marketers`
- `GET /api/users/marketers/:id`

## Products

### `GET /api/products`
List products with edition metadata, category, pricing, and schedule details.

### `GET /api/products/:id`
Get detailed product information.

### `POST /api/products`
Create a product with sales pricing.

Example payload:
```json
{
  "name": "Digital Marketing Bootcamp",
  "edition_id": "uuid-edition",
  "category_id": "uuid-category",
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

### `PUT /api/products/:id`
Update product sales content and pricing.

### `DELETE /api/products/:id`
Delete a product if it is not linked to existing orders.

## Product Categories

### `GET /api/products/categories`
List categories.

### `GET /api/products/categories/:id`
Get category details.

### `POST /api/products/categories`
Create a new category.

### `PUT /api/products/categories/:id`
Update a category.

### `DELETE /api/products/categories/:id`
Delete a category only when it has no linked products.

## Orders

### `GET /api/orders`
List all orders.

### `GET /api/orders/:id`
Get order details including order lines, lead, seller, payments, and payment plans.

### `POST /api/orders`
Create an order.

Example payload:
```json
{
  "lead_id": "uuid-lead",
  "generated_by": "uuid-user",
  "sub_total": "1200.00",
  "total_amount": "1200.00",
  "discount": "0.00",
  "order_status": "PENDING",
  "order_items": [
    {
      "product_id": "uuid-product",
      "price": "1200.00"
    }
  ]
}
```

### `PUT /api/orders/:id`
Update order fields and order items.

### `DELETE /api/orders/:id`
Delete an order if it is not completed and contains no confirmed payments.

## Payments

### `GET /api/payments`
List all payments with related order and schedule detail.

### `GET /api/payments/:id`
Get a payment by ID.

### `POST /api/payments`
Create a payment.

Example payload:
```json
{
  "order_id": "uuid-order",
  "payment_date": "2026-07-18",
  "amount": 300,
  "payment_method": "ONLINE",
  "payment_status": "PENDING",
  "type": "INSTALLMENTS",
  "payment_plan": {
    "total_installments": 4,
    "total_amount": 1200,
    "start_date": "2026-07-18",
    "scheduled_payments": [
      { "due_date": "2026-08-18", "due_amount": 300, "status": "PENDING" }
    ]
  }
}
```

### `PUT /api/payments/:id`
Update payment fields.

### `DELETE /api/payments/:id`
Delete a payment if it is not confirmed.

## Leads and Campaign Members

### `GET /api/leads`
List leads with pagination and filters.

### `GET /api/leads/:id`
Get lead details.

### `POST /api/leads`
Create a lead.

Example payload:
```json
{
  "first_name": "Maria",
  "last_name": "Lopez",
  "email": "maria@example.com",
  "phones": [
    { "number": "912345678", "type": "WHATSAPP", "isPrincipal": true }
  ],
  "lead_status": "ACTIVE"
}
```

### `PUT /api/leads/:id`
Update lead details.

### `DELETE /api/leads/:id`
Soft delete a lead.

### `PATCH /api/leads/:id/restore`
Restore a soft-deleted lead.

### Membership in campaigns
- `GET /api/campaigns/:campaignId/members`
- `POST /api/campaigns/:campaignId/members`
- `PATCH /api/campaigns/:campaignId/members/:memberId/status`
- `PATCH /api/campaigns/:campaignId/members/:memberId/reassign`
- `PATCH /api/campaigns/:campaignId/members/reassign-bulk`

### Interactions and tasks
- `GET /api/campaigns/:campaignId/members/:memberId/interactions`
- `POST /api/campaigns/:campaignId/members/:memberId/interactions`
- `GET /api/campaigns/:campaignId/members/:memberId/tasks`
- `POST /api/campaigns/:campaignId/members/:memberId/tasks`
- `PATCH /api/campaigns/:campaignId/members/:memberId/tasks/:taskId`

Interaction example:
```json
{
  "notes": "Followed up via WhatsApp, next meeting scheduled.",
  "type": "WHATSAPP"
}
```

Task example:
```json
{
  "title": "Call lead",
  "content": "Confirm availability for the next class.",
  "is_done": false,
  "due_date": "2026-07-20"
}
```

## Campaigns

### `GET /api/campaigns`
List campaigns with filters.

### `GET /api/campaigns/:id`
Get campaign details.

### `POST /api/campaigns`
Create a campaign.

Example payload:
```json
{
  "name": "Summer Funnel",
  "initial_budget": 1500,
  "start_date": "2026-07-01",
  "end_date": "2026-09-30",
  "platform": "FACEBOOK",
  "is_organic": false,
  "status": "INACTIVE",
  "product_id": "uuid-product",
  "supervisor_id": "uuid-supervisor",
  "seller_ids": ["uuid-seller-1", "uuid-seller-2"],
  "meta_form_id": "form-123"
}
```

### `PUT /api/campaigns/:id`
Update campaign data.

### `DELETE /api/campaigns/:id`
Delete a campaign.

### Seller assignment
- `POST /api/campaigns/:id/sellers`
- `DELETE /api/campaigns/:id/sellers/:sellerId`

### Meta lead sync
- `POST /api/campaigns/:id/sync-meta-leads`

## Academic Management

### Courses
- `GET /api/academic/courses`
- `GET /api/academic/courses/:id`
- `POST /api/academic/courses`
- `PUT /api/academic/courses/:id`
- `DELETE /api/academic/courses/:id`

### Editions
- `GET /api/academic/courses/editions`
- `GET /api/academic/courses/editions/:id`
- `POST /api/academic/courses/editions`
- `PUT /api/academic/courses/editions/:id`
- `DELETE /api/academic/courses/editions/:id`

Edition creation supports nested schedules, slots, and assigned professors. It validates course existence and professor activation state.

### Professors
- `GET /api/academic/professors`
- `GET /api/academic/professors/:id`
- `POST /api/academic/professors`
- `PUT /api/academic/professors/:id`
- `DELETE /api/academic/professors/:id`
- `PATCH /api/academic/professors/:id/desactivate`
- `PATCH /api/academic/professors/:id/restore`

## Storefront

### `GET /api/storefront/products`
Returns storefront-ready product listings with category, edition, and pricing information.

## CMS Content

### Product marketing content
- `GET /api/cms/products/commercial-content`
- `GET /api/cms/products/:id/commercial-content`
- `PUT /api/cms/products/:id/commercial-content`

### Benefits
- `GET /api/cms/benefits`
- `GET /api/cms/benefits/:id`
- `POST /api/cms/benefits`
- `PUT /api/cms/benefits/:id`
- `DELETE /api/cms/benefits/:id`

### Certifications
- `GET /api/cms/certifications`
- `GET /api/cms/certifications/:id`
- `POST /api/cms/certifications`
- `PUT /api/cms/certifications/:id`
- `DELETE /api/cms/certifications/:id`

### FAQs
- `GET /api/cms/faqs`
- `GET /api/cms/faqs/:id`
- `POST /api/cms/faqs`
- `PUT /api/cms/faqs/:id`
- `DELETE /api/cms/faqs/:id`

## Webhooks

### Meta leadgen webhook
- `GET /api/webhooks/meta/leadgen` — verification endpoint
- `POST /api/webhooks/meta/leadgen` — lead event ingestion

The webhook verifies `x-hub-signature-256` and processes leadgen changes from Meta.

## Validation rules

- Leads require at least one phone and exactly one `isPrincipal` phone.
- `HIBRIDO` edition products require exactly two prices: `VIRTUAL` and `PRESENCIAL`.
- Non-`HIBRIDO` edition products require exactly one `HEREDADO` price.
- Discounts require `discount_expires_at`.
- Orders require `order_items` when created.
- Installment payments require a `payment_plan` with `scheduled_payments`.

## Missing / incomplete areas

- `backend/src/routes/bulk.route.ts` exists but is not currently mounted in routing.
- `orders` and `payments` route files do not apply authentication directly in the route definitions, which may leave them exposed depending on route composition.
- Storefront only includes product list; it lacks `GET /api/storefront/products/:id` and search/filter endpoints.
- No dedicated payment gateway webhook besides Meta leadgen.
- No explicit pagination/filter support in orders and payments listings.
- There are several `TODO` comments in `backend/src/app.ts`, `backend/src/middlewares/auth.middleware.ts`, and academic edition routes.

## Project info

This project was created using `bun init` in Bun v1.2.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
