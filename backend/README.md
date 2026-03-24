# Moodle Enrollment Manager — Backend API

An enrollment and payment management system built with **Hono** and **Bun**, integrating with Moodle to handle customer orders, payments, student enrollments, and administrative reporting.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Project Architecture](#project-architecture)
- [Database Overview](#database-overview)
- [Authentication & Authorization](#authentication--authorization)
- [API Documentation](#api-documentation)
- [Business Logic](#business-logic)
- [Development Tools](#development-tools)
- [Error Handling](#error-handling)
- [Deployment](#deployment)

---

## Project Overview

The Moodle Enrollment Manager manages the complete student enrollment lifecycle:

- **Order Management** — Create and track customer purchases for course products.
- **Payment Processing** — Handle payments through multiple methods (Cash, Transfer, Online, POS, Yape).
- **Moodle Integration** — Automatic student account creation and enrollment via Moodle's REST API.
- **Admin Dashboard** — Real-time visibility into payments and sales metrics.
- **Notifications** — Automated email confirmations for payments and enrollments.

The system is built as a REST API using **Hono**, optimized for performance with the **Bun** runtime.

---

## Tech Stack

**Runtime & Framework**
- [Bun](https://bun.sh/) — Fast all-in-one JavaScript runtime
- [Hono](https://hono.dev/) — Small, simple, and ultrafast web framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety across the stack

**Database & ORM**
- [MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/) — Relational data store
- [Prisma v7.4.2](https://www.prisma.io/) — Type-safe ORM

**Validation & Security**
- [Zod](https://zod.dev/) — Schema validation with static type inference
- [@hono/zod-validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator) — Hono middleware for Zod validation
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — Password hashing

**Integration & Communication**
- [axios](https://axios-http.com/) — HTTP client for Moodle API
- [nodemailer](https://nodemailer.com/) — Email dispatch via SMTP

---

## Installation & Setup

### Prerequisites

- **Bun** (required for runtime and package management)
- **MySQL 8.0+** or **MariaDB 10.5+**

### Step 1: Install Dependencies

```bash
cd backend
bun install
```

### Step 2: Configure Environment Variables

Create a `.env` file based on `.env.local`:

```dotenv
DATABASE_URL=mysql://user:password@localhost:3306/bfedu_db
PORT=5000

# Moodle Integration
MOODLE_URL=https://your-moodle.com/webservice/rest/server.php
MOODLE_TOKEN=your_moodle_token

# Email (SMTP)
SMTP_HOST=mail.server.com
SMTP_PORT=465
SMTP_USER=user@server.com
SMTP_PASS=password

# Security
ADMIN_SECRET=your_admin_secret
```

### Step 3: Database Setup

```bash
# Generate Prisma Client
bun run prisma:generate

# Run Migrations
bun run migrate

# (Optional) Seed the database
bun run prisma:seed
```

### Step 4: Start the Server

```bash
# Development (with hot reload)
bun run dev

# Production
bun run start
```

---

## Project Architecture

The project follows a modular structure where route logic is inlined in route files, supported by specialized services for complex business logic.

### Directory Structure

```
backend/
├── src/
│   ├── index.ts           # Entry point (Bun.serve)
│   ├── app.ts             # Hono app configuration & route mounting
│   ├── routes/            # Route handlers with inlined logic (Zod validation)
│   │   ├── user.route.ts
│   │   ├── course.route.ts
│   │   ├── customer.route.ts
│   │   └── ... (others)
│   ├── services/          # Complex business logic & integrations
│   │   ├── moodle.service.ts
│   │   ├── enrollment.service.ts
│   │   └── ...
│   ├── lib/               # Shared clients (Prisma, Nodemailer)
│   │   ├── prisma.ts
│   │   └── nodemailer.ts
│   └── types/             # TypeScript definitions
├── prisma/               # Database schema & migrations
└── ...
```

### Workflow

1.  **Request** arrives at `src/index.ts`.
2.  **App Setup** in `src/app.ts` handles middleware (Logging, CORS) and routing.
3.  **Routes** in `src/routes/` utilize `zValidator` for input validation and perform database operations directly via `prisma`.
4.  **Services** in `src/services/` are called for cross-cutting concerns (Moodle API, Emailing).

---

## API Documentation

All endpoints are prefixed with `/api`.

| Feature      | Base Path         | Main File                |
| ------------ | ----------------- | ------------------------ |
| Users        | `/api/users`       | `user.route.ts`          |
| Courses      | `/api/courses`     | `course.route.ts`        |
| Customers    | `/api/customers`   | `customer.route.ts`      |
| Dashboard    | `/api/dashboard`   | `dashboard.route.ts`     |
| Enrollments  | `/api/enrollments` | `enrollment.route.ts`    |
| Orders       | `/api/orders`      | `order.route.ts`         |
| Payments     | `/api/payments`    | `payment.route.ts`       |
| Products     | `/api/products`    | `product.route.ts`       |
| Reports      | `/api/reports`     | `report.route.ts`        |
| Webhooks     | `/api/webhooks`    | `webhook.route.ts`       |

---

## Business Logic: Order & Enrollment Flow

1.  **Order Creation**: Customer selects products (`POST /api/orders`).
2.  **Payment**: Automated via webhook (`POST /api/webhooks/payment`) or manual admin registration (`POST /api/payments/manual`).
3.  **Processing**: When payment is confirmed, the order status updates to `pagado`.
4.  **Enrollment**:
    -   System checks if the Moodle user exists (or creates one).
    -   Student is enrolled in the corresponding Moodle courses.
    -   Confirmation emails are sent for both payment and enrollment.

---

## Development Tools

- **Prisma Studio**: `bun run prisma:studio` — Visual database management.
- **Linting**: `bun run lint` — ESLint checks.
- **Circular Deps**: `bun run detect-cycles` — Check for circular dependencies.

---

## Deployment

The project is configured for deployment on **Vercel** as a serverless function (see `vercel.json`).

```bash
# Deploy to Vercel
vercel deploy
```

---

**Last Updated:** March 20, 2026
LE_TOKEN=<real-moodle-token>
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
