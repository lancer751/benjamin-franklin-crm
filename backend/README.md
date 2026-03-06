# Moodle Enrollment Manager — Backend API

A course enrollment and payment management system that integrates with Moodle, handling customer orders, payments, student enrollments, and administrative reporting.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Project Architecture](#project-architecture)
- [Database Overview](#database-overview)
- [Authentication & Authorization](#authentication--authorization)
- [API Documentation](#api-documentation)
- [Business Logic](#business-logic)
- [Example Usage](#example-usage)
- [Development Tools](#development-tools)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

---

## Project Overview

The Moodle Enrollment Manager is a backend system designed to manage the complete student enrollment lifecycle:

- **Order Management** — Create and track customer purchases for course products
- **Payment Processing** — Accept payments through multiple methods (cash, bank transfer, online, POS, Yape)
- **Enrollment Integration** — Automatically enroll students in their purchased courses within Moodle
- **Admin Dashboard** — Real-time visibility into payments and sales metrics
- **Email Notifications** — Automated email confirmations for payments and enrollments
- **Reporting** — Sales and enrollment analytics with filtering

The system is built for a Spanish-language education market (Peruvian context) and exposes REST API endpoints plus a webhook for payment gateway integration.

### Key Features

- ✅ Transaction-safe order and payment processing
- ✅ Automatic Moodle student enrollment upon payment confirmation
- ✅ Multiple payment method support with state tracking
- ✅ Role-based access control (admin/seller roles)
- ✅ Real-time payment dashboard
- ✅ Sales and enrollment reports with date/course/payment-method filtering
- ✅ Duplicate payment detection and prevention

---

## Tech Stack

**Runtime & Framework**
- [Node.js](https://nodejs.org/) with [Bun](https://bun.sh/) as package manager
- [Express.js](https://expressjs.com/) v5.2.1 — HTTP server
- [TypeScript](https://www.typescriptlang.org/) — Type safety

**Database & ORM**
- [MySQL](https://www.mysql.com/) — Relational database
- [Prisma](https://www.prisma.io/) v7.4.2 — ORM with migrations
- [@prisma/adapter-mariadb](https://www.prisma.io/docs/orm/reference/adapter-mariadb) — MariaDB/MySQL adapter

**Authentication & Security**
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) v6.0.0 — Password hashing
- Shared-secret admin guard (`x-admin-secret` header)

**Integration & Communication**
- [axios](https://axios-http.com/) v1.13.5 — HTTP client for Moodle REST API
- [nodemailer](https://nodemailer.com/) v8.0.1 — Email sending via SMTP
- [cors](https://github.com/expressjs/cors) v2.8.6 — Cross-origin support
- [qs](https://github.com/ljharb/qs) v6.15.0 — Query-string serialization for Moodle payloads

**Development Tools**
- [tsx](https://github.com/esbuild-kit/tsx) v4.21.0 — TypeScript execution with watch mode
- [ESLint](https://eslint.org/) v10 — Code linting
- [@faker-js/faker](https://fakerjs.dev/) v10.3.0 — Database seeding

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ or **Bun** 1.x
- **MySQL 8.0** or **MariaDB 10.5+**
- **bun** (recommended) or **npm** / **yarn**

### Step 1: Install Dependencies

```bash
cd backend
bun install
# or
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory (you can copy from `.env.local`):

```dotenv
# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/bfedu_db
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=bfedu_db

# Server
PORT=5000
HOST=https://your-moodle-host.com

# Moodle Integration
MOODLE_URL=https://your-moodle-domain.com/webservice/rest/server.php
MOODLE_TOKEN=your_moodle_api_token
MOODLE_PASSWORD_CHANGE_PATH=/login/change_password.php

# Email Configuration (SMTP)
SMTP_HOST=mail.yourcompany.com
SMTP_PORT=465
SMTP_USER=soporte@yourcompany.com
SMTP_PASS=your_smtp_password

# Admin Authentication (shared secret guard)
ADMIN_SECRET=your_super_secret_admin_key

# Payment Gateway Webhook Signature
PAYMENT_WEBHOOK_SECRET=webhook_secret_key

# JWT (future use)
JWT_SECRET=your_jwt_secret_key
```

### Step 3: Set Up the Database

```bash
# Generate Prisma Client
bunx prisma generate
# or
npx prisma generate

# Run migrations
bunx prisma migrate dev --name init

# (Optional) Seed with sample data
bun run seeding
```

### Step 4: Start the Server

**Development** (auto-reload):
```bash
bun run dev
# or
npm run dev
```

**Production** (compiled):
```bash
npm run build
node dist/index.js
```

The server starts on `http://localhost:5000` (or your configured `PORT`).

### Verification

```bash
curl http://localhost:5000/api/courses
```

You should receive a JSON array of courses (or an empty array on a fresh database).

---

## Project Architecture

### Directory Structure

```
backend/
├── src/
│   ├── index.ts                        # Express app setup & route mounting
│   ├── config/
│   │   └── connection.ts               # Prisma client instance
│   ├── controllers/                    # HTTP request handlers (10 files)
│   │   ├── user.controller.ts          # Internal user (admin/seller) management
│   │   ├── customer.controller.ts      # Customer (Cliente) CRUD
│   │   ├── course.controller.ts        # Course & edition management
│   │   ├── product.controller.ts       # Product (priced edition) CRUD
│   │   ├── order.controller.ts         # Order (Compra) creation & retrieval
│   │   ├── payment.controller.ts       # Manual payment registration
│   │   ├── enrollment.controller.ts    # Enrollment (Matricula) retrieval & update
│   │   ├── webhook.controller.ts       # Online payment gateway webhook
│   │   ├── dashboard.controller.ts     # Payment dashboard summary
│   │   └── report.controller.ts        # Sales & enrollment reports
│   ├── services/                       # Core business logic (4 files)
│   │   ├── enrollment.service.ts       # Enrollment orchestration
│   │   ├── payment.service.ts          # Payment processing & state transitions
│   │   ├── moodle.service.ts           # Moodle API integration
│   │   └── email.service.ts            # Email notifications via SMTP
│   ├── helpers/                        # Utility functions (3 files)
│   │   ├── course.helper.ts            # Course/edition query helpers
│   │   ├── moodle.helper.ts            # Moodle REST API formatting utilities
│   │   └── user.helper.ts              # User query & credential helpers
│   ├── middleware/
│   │   └── admin.middleware.ts         # Admin shared-secret guard
│   ├── routes/                         # API endpoint definitions (10 files)
│   │   ├── user.route.ts       → /api/users
│   │   ├── customer.route.ts   → /api/customers
│   │   ├── course.route.ts     → /api/courses
│   │   ├── product.route.ts    → /api/products
│   │   ├── order.route.ts      → /api/orders
│   │   ├── payment.route.ts    → /api/payments
│   │   ├── enrollment.route.ts → /api/enrollments
│   │   ├── webhook.route.ts    → /api/webhooks
│   │   ├── dashboard.route.ts  → /api/dashboard
│   │   └── report.route.ts     → /api/reports
│   └── types/                          # TypeScript interfaces & enums (4 files)
│       ├── user.ts
│       ├── course.ts
│       ├── moodle.ts
│       └── order.type.ts
├── prisma/
│   ├── schema.prisma                   # Database schema & models
│   ├── seed.ts                         # Seeding script (faker-based)
│   └── migrations/                     # Prisma migration history
├── generated/
│   └── prisma/                         # Auto-generated Prisma Client
├── dist/                               # Compiled output (tsc)
├── package.json
├── tsconfig.json
├── eslint.config.ts
├── prisma.config.ts
└── README.md
```

### Request / Response Flow

```
HTTP Request
    ↓
Express Router (routes/*.ts)
    ↓
[adminMiddleware — if protected]
    ↓
Controller (controllers/*.ts)  — parse input, validate, return response
    ↓
Service (services/*.ts)        — business logic, transactions, external calls
    ↓
Prisma Client → MySQL Database
    ↓
JSON Response
```

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| **Controllers** | Parse HTTP requests, validate input, call services, return JSON responses |
| **Services** | Business logic, database transactions, Moodle API calls, email dispatch |
| **Helpers** | Reusable utility functions (query builders, API payload formatters) |
| **Middleware** | Authenticate & authorize requests before reaching controllers |
| **Routes** | Map HTTP verbs + paths to controllers |
| **Types** | Shared TypeScript interfaces and enums |

---

## Database Overview

### Entity Relationships

```
Role ──< Usuario (admin / seller accounts)
                    │
                    │ vendedor_id (optional)
                    ▼
Cliente ──────────< Compra >──────────< DetalleCompra >──── Producto
   │                  │                                          │
   │                  └────────────< Pago                       │
   │                                                            ▼
   └─────────────────────────────────────────────── Edicion >── Curso
                                                       │         │
   Matricula <──────────────────────────────── Edicion │    Modalidad
```

### Core Models

#### Role
System roles for internal users.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `nombre` | String | Unique role name |
| `descripcion` | String? | Optional description |
| `is_active` | Boolean | Default `true` |

#### Usuario (Internal User)
Admin and seller accounts.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `nombre` | String | First name |
| `apellido_paterno` | String | Paternal surname |
| `apellido_materno` | String? | Maternal surname (optional) |
| `email` | String | Unique |
| `telefono` | String? | Phone number |
| `role_id` | UUID | FK → Role |
| `is_active` | Boolean | Account status |
| `password` | String | bcrypt-hashed |

#### Cliente (Customer)
External students / purchasers.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `nombre` | String | First name |
| `apellido_paterno` | String | Paternal surname |
| `apellido_materno` | String | Maternal surname |
| `telefono` | Char(9)? | Peruvian mobile format |
| `email` | String | Unique |
| `dni` | Char(8) | National ID, unique |
| `moodle_user_id` | Int? | Linked Moodle user ID |
| `credentials_sent` | Boolean | Whether Moodle credentials were emailed |

#### Curso (Course)
Master course catalogue.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `nombre` | String | Course name |
| `descripcion` | String? | Description |
| `status` | CursoStatus | `activo` \| `inactivo` |
| `duracion_semanas` | Int | Duration in weeks |

#### Modalidad
Delivery modality (e.g. online, presencial, híbrido).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `nombre` | String | Unique modality name |

#### Edicion (Course Edition)
A specific, time-bound offering of a course with a defined modality and an optional Moodle mapping.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `curso_id` | UUID | FK → Curso |
| `fecha_inicio` | Date? | Start date |
| `fecha_finalizacion` | Date? | End date |
| `modalidad_id` | UUID | FK → Modalidad |
| `moodle_course_id` | Int? | Moodle course ID (unique) |

#### Producto (Product)
A priced edition available for sale.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `edicion_id` | UUID | FK → Edicion |
| `precio` | Decimal(10,2) | Price in S/ (Peruvian sol) |

#### Compra (Order)
A customer's purchase grouping one or more products.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `cliente_id` | UUID | FK → Cliente |
| `vendedor_id` | UUID? | FK → Usuario (optional) |
| `costo_total` | Decimal(10,2) | Total amount |
| `estado_order` | CompraEstado | Order state |
| `numero_order` | Char(10) | Unique order number |

#### DetalleCompra (Order Line Item)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `compra_id` | UUID | FK → Compra |
| `producto_id` | UUID | FK → Producto |
| `costo_unitario` | Decimal(10,2) | Unit price at time of purchase |

#### Pago (Payment)
Individual payment transactions linked to an order.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `orden_id` | UUID | FK → Compra |
| `cantidad` | Decimal(10,2) | Amount paid |
| `estado` | PagoEstado | Payment state |
| `codigo_transaccion` | String? | Gateway transaction code (unique) |
| `fecha_pago` | DateTime? | Payment timestamp |
| `metodo_pago` | MetodoPago | Payment method |

#### Matricula (Enrollment)
A student's enrollment in a specific course edition.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `cliente_id` | UUID | FK → Cliente |
| `edicion_id` | UUID | FK → Edicion |
| `estado` | MatriculaEstado | Enrollment state |

### Enums

| Enum | Values |
|------|--------|
| **CursoStatus** | `activo`, `inactivo` |
| **CompraEstado** | `pendiente`, `pagado`, `cancelado`, `reembolsado` |
| **PagoEstado** | `pendiente`, `confirmado`, `rechazado`, `reembolsado` |
| **MatriculaEstado** | `activo`, `retirado`, `completado` |
| **MetodoPago** | `efectivo`, `transferencia`, `pos`, `online`, `yape` |

---

## Authentication & Authorization

### Admin Middleware (`admin.middleware.ts`)

Admin-protected endpoints require the `x-admin-secret` header. The value must match the `ADMIN_SECRET` environment variable (or the default `"admin-secret-key"` if not set).

```
x-admin-secret: <ADMIN_SECRET>
```

**Protected Endpoints:**
- `POST /api/courses` — Create course
- `PUT /api/courses/:id` — Update course
- `POST /api/payments/manual` — Register manual payment

> **Note:** This is a simple shared-secret guard designed for MVP use. Replace with JWT-based authentication (using `JWT_SECRET`) before going to production.

---

## API Documentation

All endpoints are prefixed with `/api` and return JSON.

### Users `/api/users`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users` | List all internal users |
| `GET` | `/api/users/:id` | Get user by ID |
| `POST` | `/api/users` | Create a new user |
| `PUT` | `/api/users/:id` | Update a user |

---

### Customers `/api/customers`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/customers` | List all customers |
| `GET` | `/api/customers/:id` | Get customer by ID |
| `POST` | `/api/customers` | Create a new customer |
| `PUT` | `/api/customers/:id` | Update customer data |

---

### Courses `/api/courses`

| Method | Path | Protection | Description |
|--------|------|-----------|-------------|
| `GET` | `/api/courses` | — | List all courses |
| `GET` | `/api/courses/:id` | — | Get course by ID (includes editions) |
| `POST` | `/api/courses` | Admin | Create a new course |
| `PUT` | `/api/courses/:id` | Admin | Update a course |

---

### Products `/api/products`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Get product by ID |
| `POST` | `/api/products` | Create a product (with edition) |
| `PUT` | `/api/products/:id` | Update a product |

---

### Orders `/api/orders`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/:id` | Get order with line items and payments |
| `POST` | `/api/orders` | Create a new order (Compra) |
| `PUT` | `/api/orders/:id` | Update order status or seller |

---

### Payments `/api/payments`

| Method | Path | Protection | Description |
|--------|------|-----------|-------------|
| `GET` | `/api/payments` | — | List all payments |
| `GET` | `/api/payments/:id` | — | Get payment by ID |
| `POST` | `/api/payments/manual` | Admin | Register a manual payment & trigger enrollment |
| `PUT` | `/api/payments/manual/:id` | — | Update payment status |

---

### Webhooks `/api/webhooks`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/webhooks/payment` | Receive payment confirmation from online gateway (Culqi) |

The webhook validates the payment signature, registers the `Pago`, marks the `Compra` as `pagado`, and triggers automatic Moodle enrollment.

---

### Enrollments `/api/enrollments`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/enrollments` | List all enrollments |
| `GET` | `/api/enrollments/:id` | Get enrollment details |
| `POST` | `/api/enrollments` | Manually generate an enrollment |
| `PUT` | `/api/enrollments/:id` | Update enrollment status |

---

### Dashboard `/api/dashboard`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard/payments` | Payment summary dashboard |

---

### Reports `/api/reports`

| Method | Path | Query Params | Description |
|--------|------|--------------|-------------|
| `GET` | `/api/reports/sales` | `startDate`, `endDate`, `courseId`, `paymentMethod` | Filtered sales & enrollment report |

---

## Business Logic

### Order-to-Enrollment Workflow

```
1. CREATE ORDER (Compra)
   Customer selects products → POST /api/orders
   ├─ Compra.estado_order = "pendiente"
   ├─ Cliente associated
   └─ DetalleCompra items created

2. PAYMENT
   Online gateway  → POST /api/webhooks/payment
   OR admin manual → POST /api/payments/manual
   ├─ Pago record created (method, amount, transaction code)
   └─ Pago.estado = "confirmado" | "rechazado" | "pendiente"

3. PAYMENT CONFIRMED
   ├─ Compra.estado_order → "pagado"
   ├─ Email: payment confirmation sent to customer
   └─ Auto-enrollment triggered

4. AUTO-ENROLLMENT
   For each DetalleCompra → Producto → Edicion:
   ├─ Matricula record created (estado = "activo")
   ├─ Moodle API: enroll student in moodle_course_id
   └─ Email: enrollment confirmation sent to customer

5. COMPLETION
   └─ Student can access course in Moodle
```

### Payment Methods

| Method | Use Case |
|--------|----------|
| `online` | Credit/debit card, online gateway (Culqi) |
| `transferencia` | Bank transfer |
| `efectivo` | Cash, in-person |
| `pos` | Point-of-sale terminal |
| `yape` | Peruvian mobile payment app |

### Moodle Integration

The `moodle.service.ts` and `moodle.helper.ts` handle all Moodle REST API calls:

- **Create user** — Creates a Moodle account using the student's name, DNI, and email
- **Enroll in course** — Enrolls the student in the edition's `moodle_course_id`
- **Send credentials** — Emails the student their initial Moodle password

Moodle calls are made to `MOODLE_URL` using the `MOODLE_TOKEN` API token.

---

## Example Usage

### Complete Purchase & Enrollment Flow

**1. Create Customer**
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pedro",
    "apellido_paterno": "Morales",
    "apellido_materno": "Ruiz",
    "email": "pedro@example.com",
    "telefono": "912345678",
    "dni": "12345678"
  }'
```

**2. Browse Products**
```bash
curl http://localhost:5000/api/products
```

**3. Create Order**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "<customer-uuid>",
    "detalles": [
      { "producto_id": "<product-uuid>", "costo_unitario": 299.99 }
    ]
  }'
```

**4. Register Manual Payment (Admin)**
```bash
curl -X POST http://localhost:5000/api/payments/manual \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your_admin_secret" \
  -d '{
    "orden_id": "<order-uuid>",
    "cantidad": 299.99,
    "metodo_pago": "transferencia",
    "codigo_transaccion": "TXN-2026-001"
  }'
```

**5. Verify Enrollment**
```bash
curl http://localhost:5000/api/enrollments
```

---

## Development Tools

### Prisma Studio
```bash
bunx prisma studio
```
Opens visual database browser at `http://localhost:5555`.

### Prisma Migrations
```bash
# Create and apply a new migration
bunx prisma migrate dev --name <migration_name>

# Check migration status
bunx prisma migrate status

# Reset the database (drops all data)
bun run reset-db
```

### Database Seeding
```bash
bun run seeding
```

### Linting
```bash
npx eslint src/
```

### Build
```bash
npm run build
node dist/index.js
```

---

## Error Handling

All controllers return standard HTTP status codes with a JSON error body `{ "error": "message" }`:

| Status | Description |
|--------|-------------|
| `400` | Bad Request — Missing or invalid input |
| `401` | Unauthorized — Invalid webhook signature |
| `403` | Forbidden — Admin access required |
| `404` | Not Found — Resource does not exist |
| `409` | Conflict — Duplicate transaction or existing enrollment |
| `500` | Internal Server Error |

---

## Deployment

### Production Environment Variables

```dotenv
DATABASE_URL=mysql://prod_user:<strong-password>@db-host:3306/bfedu_db
MOODLE_TOKEN=<real-moodle-token>
SMTP_HOST=smtp.sendgrid.net
ADMIN_SECRET=<very-long-random-string>
JWT_SECRET=<random-secret>
PAYMENT_WEBHOOK_SECRET=<random-secret>
```

### Build & Run

```bash
npm run build
node dist/index.js
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

```bash
docker build -t moodle-enrollment-backend .
docker run -p 5000:5000 --env-file .env moodle-enrollment-backend
```

---

## Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Docs](https://expressjs.com/)
- [Moodle Web Service API](https://docs.moodle.org/dev/Web_service_API_functions)
- [Culqi (Payment Gateway)](https://docs.culqi.com/)

---

## License

MIT License — See `LICENSE` file for details.

---

**Last Updated:** March 6, 2026  
**Version:** 1.1.0
