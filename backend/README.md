# Moodle Enrollment Manager - Backend API

A comprehensive course enrollment and payment management system that seamlessly integrates with Moodle, handling customer orders, payments, student enrollments, and administrative reporting.

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

---

## Project Overview

The Moodle Enrollment Manager is a production-ready backend system designed to manage the complete student enrollment lifecycle:

- **Order Management**: Create and track customer purchases for course products
- **Payment Processing**: Accept payments through multiple methods (cash, bank transfer, online, POS, Yape)
- **Enrollment Integration**: Automatically enroll students in their purchased courses within Moodle
- **Admin Dashboard**: Real-time visibility into payments and sales metrics
- **Email Notifications**: Automated email confirmations for payments and enrollments
- **Reporting**: Comprehensive sales and enrollment analytics with filtering

The system is built for a Spanish-language education market (Peruvian context based on currency and terminology) and provides both REST API endpoints and webhook support for payment gateway integration.

### Key Features

- ✅ Transaction-safe order and payment processing
- ✅ Automatic Moodle student enrollment upon payment confirmation
- ✅ Multiple payment method support with state tracking
- ✅ Role-based access control (admin/seller roles)
- ✅ Real-time payment dashboard
- ✅ Sales and enrollment reports with date/course/payment method filtering
- ✅ Development/simulation mode for testing
- ✅ Duplicate payment detection and recovery
- ✅ Simulated email notifications (console logging)

---

## Tech Stack

**Runtime & Framework**
- [Node.js](https://nodejs.org/) - via Bun runtime
- [Express.js](https://expressjs.com/) v5.2.1 - HTTP server
- [TypeScript](https://www.typescriptlang.org/) - Type safety

**Database & ORM**
- [MySQL](https://www.mysql.com/) - Relational database
- [Prisma](https://www.prisma.io/) v7.4.2 - ORM with migrations
- [@prisma/adapter-mariadb](https://www.prisma.io/docs/orm/reference/adapter-mariadb) - MariaDB adapter

**Authentication & Security**
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) v6.0.0 - Password hashing
- JWT support for admin authentication

**Integration & Communication**
- [axios](https://axios-http.com/) v1.13.5 - HTTP client for Moodle API
- [nodemailer](https://nodemailer.com/) v8.0.1 - Email sending (SMTP configured)
- [cors](https://github.com/expressjs/cors) v2.8.5 - Cross-origin support

**Development Tools**
- [tsx](https://github.com/esbuild-kit/tsx) v4.21.0 - TypeScript execution
- [ESLint](https://eslint.org/) - Code linting
- [@faker-js/faker](https://fakerjs.dev/) v10.3.0 - Database seeding

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ (or Bun 1.3.8+)
- **MySQL 8.0** or **MariaDB 10.5+**
- **npm**, **yarn**, or **bun** package manager

### Step 1: Clone & Install Dependencies

```bash
cd backend
npm install
# or
bun install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the `backend/` directory with the following variables:

```dotenv
# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/moodle_enrollment
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=moodle_enrollment

# Server Configuration
PORT=3000
HOST=localhost

# Moodle Integration
MOODLE_URL=https://your-moodle-domain.com/webservice/rest/server.php
MOODLE_TOKEN=your_moodle_api_token
MOODLE_PASSWORD_CHANGE_PATH=/login/change_password.php

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourcompany.com

# Admin Authentication
ADMIN_SECRET=your_super_secret_admin_key

# Payment Gateway (Optional — simulated in MVP)
PAYMENT_WEBHOOK_SECRET=webhook_secret_key

# JWT Configuration (Optional)
JWT_SECRET=your_jwt_secret_key
```

### Step 3: Set Up the Database

Initialize Prisma and create the database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### Step 4: Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
# or
bun run dev
```

**Production Mode** (compiled):
```bash
npm run build
node dist/index.js
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Verification

Check that the server is running by visiting:
```
http://localhost:3000/api/courses
```

You should receive a JSON response with courses or an empty array.

---

## Project Architecture

### Directory Structure

```
backend/
├── src/
│   ├── index.ts                 # Express app setup & route mounting
│   ├── config/
│   │   └── connection.ts        # Database & external API configuration
│   ├── controllers/             # HTTP request handlers
│   │   ├── user.controller.ts          # Admin user management
│   │   ├── customer.controller.ts      # Customer (Cliente) CRUD
│   │   ├── course.controller.ts        # Course management
│   │   ├── product.controller.ts       # Product (with edition) CRUD
│   │   ├── order.controller.ts         # Order (Compra) creation & retrieval
│   │   ├── payment.controller.ts       # Payment registration (admin)
│   │   ├── enrollment.controller.ts    # Enrollment (Matricula) retrieval
│   │   ├── webhook.controller.ts       # Payment gateway webhook handler
│   │   ├── dashboard.controller.ts     # Payment dashboard
│   │   ├── report.controller.ts        # Sales & enrollment reports
│   │   └── dev.controller.ts           # Development/simulation endpoints
│   ├── services/                # Core business logic
│   │   ├── payment.service.ts          # Payment processing & state transitions
│   │   ├── enrollment.service.ts       # Student enrollment orchestration
│   │   ├── email.service.ts            # Email notifications (simulated)
│   │   └── moodle.service.ts           # Moodle API integration
│   ├── helpers/
│   │   └── moodle.helper.ts            # Moodle REST API utilities
│   ├── middleware/
│   │   └── admin.middleware.ts         # Admin authentication (JWT/secret key)
│   ├── routes/                  # API endpoint definitions
│   │   ├── user.route.ts        → /api/users
│   │   ├── customer.route.ts    → /api/customers
│   │   ├── course.route.ts      → /api/courses
│   │   ├── product.route.ts     → /api/products
│   │   ├── order.route.ts       → /api/orders
│   │   ├── payment.route.ts     → /api/payments
│   │   ├── enrollment.route.ts  → /api/enrollments
│   │   ├── webhook.route.ts     → /api/webhooks
│   │   ├── dashboard.route.ts   → /api/dashboard
│   │   ├── report.route.ts      → /api/reports
│   │   └── dev.route.ts         → /api/dev
│   ├── types/                   # TypeScript interfaces & types
│   │   ├── user.ts
│   │   ├── order.type.ts
│   │   ├── course.ts
│   │   ├── moodle.ts
│   │   └── ...
│   └── model/                   # (Reserved for future use)
├── prisma/
│   ├── schema.prisma            # Database schema & models
│   ├── seed.ts                  # Database seeding script
│   └── migrations/              # Prisma migration history
├── generated/
│   └── prisma/                  # Auto-generated Prisma Client types
├── package.json
├── tsconfig.json
├── eslint.config.ts
└── README.md
```

### Request/Response Flow

```
HTTP Request
    ↓
Express Router (route/*.ts)
    ↓
Controller (controllers/*.ts)
    ↓
Service (services/*.ts) — Business Logic
    ↓
Prisma Client → Database
    ↓
Response (JSON)
```

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| **Controllers** | Parse HTTP requests, validate input, call services, return responses |
| **Services** | Implement business logic, database transactions, external API calls |
| **Helpers** | Utility functions (Moodle API formatting, queries, etc.) |
| **Middleware** | Authenticate & authorize requests before reaching controllers |
| **Routes** | Define HTTP endpoint paths and link to controllers |

### Authentication Strategy

**Current Implementation** (Simple):
- Admin endpoints are protected by the `adminMiddleware`
- Expects header: `x-admin-secret: <ADMIN_SECRET>`
- Compares against `ADMIN_SECRET` environment variable

**Recommended Upgrade** (Production):
- Replace with JWT tokens signed with `JWT_SECRET`
- Include user roles (admin, seller, customer) in token payload
- Validate token signature and expiration on protected routes

---

## Database Overview

### Core Models

#### Usuario (Internal User)
Represents admin and seller accounts in the system.

```typescript
{
  id: UUID,                   // Unique identifier
  nombre: string,             // First name
  apellido_paterno: string,   // Paternal surname
  apellido_materno: string,   // Maternal surname
  email: string,              // Unique email
  telefono: string,           // Phone number
  role_id: UUID,              // Foreign key to Role
  is_active: boolean,         // Account status
  password: string,           // Hashed password (bcrypt)
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Cliente (Customer)
Represents external students/clients who purchase courses.

```typescript
{
  id: UUID,
  nombre: string,
  apellido_paterno: string,
  apellido_materno: string,
  telefono: string,           // 9-digit Peruvian format
  email: string,              // Unique
  dni: string,                // National ID (8 digits, unique)
  moodle_user_id: number,     // Moodle user ID (optional)
  credentials_sent: boolean,  // Moodle credentials sent flag
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Curso (Course)
Master course information.

```typescript
{
  id: UUID,
  nombre: string,             // Course name
  descripcion: string,        // Course description
  status: CursoStatus,        // activo | inactivo
  duracion_semanas: number,   // Duration in weeks
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Edicion (Course Edition)
A specific offering of a course (time-bound, mode-bound).

```typescript
{
  id: UUID,
  curso_id: UUID,
  fecha_inicio: Date,         // Start date (optional)
  fecha_finalizacion: Date,   // End date (optional)
  modalidad_id: UUID,         // online, presencial, hybrid
  moodle_course_id: string,   // Moodle course ID (optional)
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Producto (Product)
A priced course edition (for sale).

```typescript
{
  id: UUID,
  edicion_id: UUID,
  precio: Decimal(10,2),      // Price in S/ (Peruvian sol)
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Compra (Order)
A customer's purchase containing one or more products.

```typescript
{
  id: UUID,
  cliente_id: UUID,
  vendedor_id: UUID (nullable), // Seller (optional)
  costo_total: Decimal(10,2),
  estado_order: CompraEstado, // pendiente → pagado → (cancelado|reembolsado)
  numero_order: string,       // Unique order number (10 chars)
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Pago (Payment)
Individual payment transactions for an order.

```typescript
{
  id: UUID,
  orden_id: UUID,             // Foreign key to Compra
  cantidad: Decimal(10,2),    // Amount paid
  estado: PagoEstado,         // pendiente | confirmado | rechazado | reembolsado
  codigo_transaccion: string, // Transaction code from payment gateway
  fecha_pago: DateTime,       // Payment timestamp
  metodo_pago: MetodoPago,    // Payment method
  createdAt: DateTime,
  updatedAt: DateTime
}
```

#### Matricula (Enrollment)
Represents a student's enrollment in a course edition.

```typescript
{
  id: UUID,
  cliente_id: UUID,
  edicion_id: UUID,
  estado: MatriculaEstado,    // activo | retirado | completado
  createdAt: DateTime,
  updatedAt: DateTime
}
```

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

### Admin Middleware

Admin-protected endpoints require the `x-admin-secret` header:

```
Header: x-admin-secret = <ADMIN_SECRET from .env>
```

**Protected Endpoints:**
- `POST /api/courses` — Create course
- `PUT /api/courses/:id` — Update course
- `POST /api/payments/manual` — Register manual payment

---

## API Documentation

All endpoints are prefixed with `/api` and return JSON responses.

### User Management `/api/users`

**GET /api/users** — List all users
**GET /api/users/:id** — Get user by ID
**POST /api/users** — Create user (admin only)
**PUT /api/users/:id** — Update user (admin only)

### Customer Management `/api/customers`

**GET /api/customers** — List all customers
**GET /api/customers/:id** — Get customer by ID
**POST /api/customers** — Create customer
**PUT /api/customers/:id** — Update customer

### Course Management `/api/courses`

**GET /api/courses** — List courses (paginated)
**GET /api/courses/:id** — Get course by ID
**POST /api/courses** — Create course (admin only)
**PUT /api/courses/:id** — Update course (admin only)

### Product Management `/api/products`

**GET /api/products** — List all products
**GET /api/products/:id** — Get product by ID
**POST /api/products** — Create product with edition
**PUT /api/products/:id** — Update product

### Order Management `/api/orders`

**GET /api/orders** — List all orders
**GET /api/orders/:id** — Get complete order with line items and payments
**POST /api/orders** — Create order (Compra)
**PUT /api/orders/:id** — Update order status/vendor

### Payment Management `/api/payments`

**GET /api/payments** — List payments
**GET /api/payments/:id** — Get payment by ID
**POST /api/payments/manual** — Register manual payment (admin only)

### Payment Webhooks `/api/webhooks`

**POST /api/webhooks/payment** — Receive payment confirmation from gateway

### Enrollment `/api/enrollments`

**GET /api/enrollments** — List all enrollments
**GET /api/enrollments/:id** — Get enrollment details

### Dashboard `/api/dashboard`

**GET /api/dashboard/payments** — Payment dashboard with recent transactions

### Reports `/api/reports`

**GET /api/reports/sales** — Sales & enrollment analytics (with filters)

### Development `/api/dev`

**POST /api/dev/simulate-payment** — Simulate payment (dev only)
**GET /api/dev/emails** — View simulated emails (dev only)
**DELETE /api/dev/emails** — Clear email store (dev only)

---

## Business Logic

### The Order-to-Enrollment Workflow

```
1. CREATE ORDER (Compra)
   Customer selects products → POST /api/orders
   ├─ Compra state: "pendiente"
   ├─ Cliente associated
   └─ DetalleCompra items created

2. PAYMENT INITIATED
   Customer pays via gateway → POST /api/webhooks/payment
   OR admin registers → POST /api/payments/manual
   ├─ Pago created with method & amount
   └─ Pago state: "confirmado" | "rechazado" | "pendiente"

3. PAYMENT CONFIRMATION (if "confirmado")
   ├─ Compra state → "pagado"
   ├─ Email: Payment confirmation sent
   └─ Auto-Enrollment Triggered!

4. AUTO-ENROLLMENT
   System enrolls customer in purchased courses:
   ├─ For each DetalleCompra → Producto → Edicion → Curso:
   │  ├─ Create Matricula record
   │  ├─ Simulate Moodle enrollment
   │  └─ Send enrollment success email
   ├─ Matricula state: "activo"
   └─ Customer ready to access course in Moodle

5. COMPLETION
   ├─ Enroll confirms in Moodle dashboard
   └─ Course content accessible
```

### Payment Methods

The system supports five payment methods:

| Method | Use Case |
|--------|----------|
| **online** | Credit/debit card, online gateways |
| **transferencia** | Bank transfer |
| **efectivo** | Cash, in-person |
| **pos** | Point-of-sale, card reader |
| **yape** | Peruvian mobile payment app |

---

## Example Usage

### Complete Purchase & Enrollment Flow

**Step 1: Create Customer**
```bash
POST /api/customers
{
  "nombre": "Pedro",
  "apellido_paterno": "Morales",
  "apellido_materno": "Ruiz",
  "email": "pedro@example.com",
  "telefono": "912345678",
  "dni": "12345678"
}
```

**Step 2: Get Products**
```bash
GET /api/products
```

**Step 3: Create Order**
```bash
POST /api/orders
{
  "cliente_id": "cust-uuid",
  "detalles": [
    {
      "producto_id": "prod-uuid",
      "costo_unitario": 299.99
    }
  ]
}
```

**Step 4: Process Payment**
```bash
POST /api/webhooks/payment
{
  "orderId": "order-uuid",
  "amount": 299.99,
  "status": "confirmado",
  "transactionCode": "TXNCODE-001"
}
```

**Step 5: Verify Enrollment**
```bash
GET /api/enrollments
```

---

## Development Tools

### Prisma Studio
```bash
npx prisma studio
```
Opens `http://localhost:5555` for visual data exploration.

### Prisma Migrations
```bash
npx prisma migrate dev --name your_migration_name
npx prisma migrate status
npx prisma migrate reset
```

### Database Seeding
```bash
npx prisma db seed
```

### Build & Run
```bash
npm run build
node dist/index.js
```

---

## Error Handling

### Standard Error Responses

| Status | Message |
|--------|---------|
| **400** | Bad Request — Invalid input |
| **401** | Unauthorized — Invalid webhook signature |
| **403** | Forbidden — Admin access required |
| **404** | Not Found — Resource does not exist |
| **500** | Internal Server Error |

---

## Deployment

### Production Environment Setup

```dotenv
DATABASE_USER=prod_user
DATABASE_PASSWORD=<strong-password>
MOODLE_TOKEN=<real-token>
SMTP_HOST=smtp.sendgrid.net
ADMIN_SECRET=<very-long-random-string>
JWT_SECRET=<random-secret>
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
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```bash
docker build -t moodle-enrollment-backend .
docker run -p 3000:3000 --env-file .env.local moodle-enrollment-backend
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit: `git commit -m "Add feature description"`
4. Push and create a pull request

### Code Style

- Use TypeScript for all code
- Run ESLint: `npx eslint src/`
- Follow naming conventions: camelCase for variables, PascalCase for types

---

## Support & Documentation

- **Prisma Docs:** https://www.prisma.io/docs/
- **Express Docs:** https://expressjs.com/
- **Moodle API:** https://docs.moodle.org/dev/Web_service_API_functions

---

## License

MIT License — See LICENSE file for details.

---

**Last Updated:** March 3, 2026
**Version:** 1.0.0
