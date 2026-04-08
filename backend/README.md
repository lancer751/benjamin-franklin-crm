# Moodle Enrollment Manager — Backend API

A high-performance REST API for managing student enrollments, payments, and course administration integrated with Moodle LMS. Built with **Hono** and **Bun**, using **Prisma** for type-safe database operations.

**Version:** 1.0.0  
**Last Updated:** April 2026

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Installation & Setup](#installation--setup)
4. [Core Concepts & Workflow](#core-concepts--workflow)
5. [API Endpoints](#api-endpoints)
6. [Request & Response Format](#request--response-format)
7. [Database Models](#database-models)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [Development & Deployment](#development--deployment)

---

## Project Overview

The Moodle Enrollment Manager handles the complete lifecycle of student enrollments and course sales:

### Main Capabilities

- **Lead Management** — Capture, track, and qualify leads from marketing campaigns (social media, website, WhatsApp)
- **Campaign Management** — Create and manage multi-platform marketing campaigns linked to course editions
- **Course & Product Management** — Define courses, editions (course runs), modalities, and pricing
- **Sales Order Processing** — Create orders with multiple products and manage order status
- **Payment Processing** — Handle multiple payment methods (cash, bank transfer, online, POS, Yape) with support for installment plans
- **User & Role Management** — Manage staff with role-based access control (SALES_REP, MARKETING, ADMIN, etc.)
- **Campaign Member Tracking** — Track prospect status and interactions within campaigns
- **Seller Profiles** — Manage sales representatives with targets and discounts

### Use Cases

| Use Case | Flow |
|----------|------|
| **Lead Conversion** | Lead captured → Assigned to campaign → Interactions tracked → Order created → Payment processed |
| **Course Sale** | Create course edition → Define products (pricing) → Create campaign → Sell products → Manage payments |
| **Sales Tracking** | Sales rep assigned → Leads tracked → Interactions logged → Orders recorded → Commission tracking |
| **Multi-Installment Sale** | Order created → Payment plan defined → Scheduled payments tracked → Installments collected |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | [Bun](https://bun.sh/) — All-in-one JavaScript runtime optimized for speed |
| **Framework** | [Hono](https://hono.dev/) — Lightweight, ultra-fast REST API framework |
| **Language** | TypeScript 5+ — Full type safety |
| **Database** | MySQL 8.0+ / MariaDB 10.5+ via [Prisma v7.4.2](https://www.prisma.io/) |
| **Validation** | [Zod](https://zod.dev/) — Runtime schema validation |
| **Authentication** | JWT (optional, can be implemented) |
| **HTTP Client** | [Axios](https://axios-http.com/) — Moodle API integration |
| **Email** | [Nodemailer](https://nodemailer.com/) — SMTP for notifications |
| **Utilities** | [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) — Password hashing |

---

## Installation & Setup

### Prerequisites

Before getting started, ensure you have:

- **Bun** (latest version) — [Install Bun](https://bun.sh)
- **MySQL 8.0+** or **MariaDB 10.5+** running locally or remotely
- **Git** for version control

Verify installations:

```bash
bun --version
mysql --version
```

### Step 1: Clone & Install Dependencies

```bash
cd backend
bun install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory using `.env.local` as a template:

```bash
cp .env.local .env
```

Edit `.env` with your configuration:

```dotenv
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=moodle_enrollment_db

# Server Configuration
PORT=5000
HOST=localhost

# Moodle Integration (Optional)
MOODLE_URL=https://your-moodle-instance.com/webservice/rest/server.php
MOODLE_TOKEN=your_moodle_api_token
MOODLE_PASSWORD_CHANGE_PATH=/auth/override/password_change.php

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password

# Security
JWT_SECRET=your_random_jwt_secret_key_here
PAYMENT_WEBHOOK_SECRET=your_webhook_secret_key

# Environment
NODE_ENV=development
```

**Important Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Full connection string (auto-generated) | `mysql://user:pass@localhost:3306/db` |
| `MOODLE_TOKEN` | API token from Moodle admin panel | Get from Moodle → Site Administration |
| `JWT_SECRET` | Secret key for signing JWT tokens | Use a strong random string (e.g., 32+ chars) |
| `PAYMENT_WEBHOOK_SECRET` | Secret for validating payment webhooks | Use a strong random string |

### Step 3: Initialize Database

**Generate Prisma Client:**

```bash
bun run prisma:generate
```

**Run Migrations:**

```bash
# Apply migrations to your database
bun run prisma:migrate

# (Optional) Seed database with initial data
bun run prisma:seed

# (Optional) Reset database completely
bun run db:reset
```

### Step 4: Run the Server

**Development Mode** (with hot reload):

```bash
bun run dev
```

Expected output:

```
Server running at http://localhost:5000
NODE_ENV: development
```

**Production Mode:**

```bash
bun run start
```

### Verify Installation

Test the API health check:

```bash
curl http://localhost:5000
```

Expected response:

```json
{
  "status": "ok"
}
```

---

## Core Concepts & Workflow

### Lead-to-Sale Workflow

The system models a typical B2B SaaS sales funnel:

```
1. LEAD CAPTURE
   ├─ Lead created from external source (website form, social media, etc.)
   └─ Phone numbers added (WhatsApp, Telephone)

2. CAMPAIGN ASSIGNMENT
   ├─ Lead assigned to a marketing campaign
   ├─ Campaign member status: NEW → CONTACTED → QUALIFIED → ...
   └─ Lead can be in multiple campaigns

3. SALES INTERACTION
   ├─ Sales reps interact with leads
   ├─ Interaction types: WEBSITE_FORM, CALL, WHATSAPP, EMAIL, MEETING, SELL
   └─ Notes logged for each interaction

4. ORDER CREATION
   ├─ Order created for qualified lead
   ├─ Order contains multiple order details (products)
   └─ Order status: PENDING → COMPLETED → REFUNDED

5. PAYMENT PROCESSING
   ├─ Payment recorded (method: CASH, BANK_TRANSFER, ONLINE, POS, YAPE)
   ├─ For installments: Payment plan created → Scheduled payments
   └─ Payment status: PENDING → CONFIRMED → FAILED

6. COMPLETION
   └─ Order marked as COMPLETED when payment confirmed
```

### Key Entities & Relationships

```
Lead (prospect)
├─ Multiple phone numbers (WhatsApp, Telephone)
├─ Multiple campaign memberships (campaigns they're part of)
├─ Multiple interactions (tracked sales touches)
└─ Multiple orders (purchases)

Order (customer purchase)
├─ Contains multiple order details (products bought)
├─ Multiple payments
└─ Optional payment plan (for installments)

Campaign (marketing initiative)
├─ Linked to one course edition
├─ Multiple campaign members (leads in campaign)
├─ Platform: FACEBOOK, INSTAGRAM, TIKTOK, WEBSITE
└─ Status tracking and budget management

Course Edition (course instance)
├─ Belongs to one course
├─ One modality (online, in-person, hybrid)
├─ Multiple products (different pricing options)
└─ Linked to one campaign

User (staff member)
├─ Role: SALES_REP, MARKETING, ADMIN, SALES_SUPERVISOR, COLLECTIONS
├─ Optional seller profile (if sales rep)
└─ Optional marketing profile (if marketer)

Seller Profile (sales rep details)
├─ Sales target and max discount
├─ Multiple campaign member assignments
├─ Multiple lead interactions
└─ Multiple orders generated
```

---

## API Endpoints

All endpoints are prefixed with `/api`. Responses use a standardized JSON format (see [Request & Response Format](#request--response-format)).

### Leads API `/api/leads`

**Get All Leads**

```
GET /api/leads
```

Returns all leads in the system.

| Aspect | Details |
|--------|---------|
| **Authentication** | Optional |
| **Query Parameters** | None (pagination planned for future) |
| **Response** | Array of Lead objects |

Example Response:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "middle_name": "David",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "secondary_email": null,
    "cellphone": "987654321",
    "profession": "Software Engineer",
    "gender": "MALE",
    "address": "123 Main St, New York",
    "second_address": null,
    "dni": "12345678",
    "moodle_user_id": null,
    "lead_status": "ACTIVE",
    "primary_campaign_id": null,
    "created_at": "2026-04-08T10:30:00Z",
    "updated_at": "2026-04-08T10:30:00Z"
  }
]
```

---

**Get Lead Details**

```
GET /api/leads/:id
```

Returns detailed information for a specific lead.

| Aspect | Details |
|--------|---------|
| **URL Parameters** | `id` (UUID) |
| **Response** | Lead object |
| **Status Codes** | `200` Success, `404` Lead not found |

Example Request:

```bash
curl http://localhost:5000/api/leads/550e8400-e29b-41d4-a716-446655440000
```

Example Response (200):

```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "middle_name": "David",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "cellphone": "987654321",
    "profession": "Software Engineer",
    "gender": "MALE",
    "address": "123 Main St, New York",
    "dni": "12345678",
    "lead_status": "ACTIVE",
    "created_at": "2026-04-08T10:30:00Z"
  }
}
```

---

**Get Lead Interactions**

```
GET /api/leads/:id/interactions
```

Retrieves all interactions (touchpoints) for a specific lead.

| Aspect | Details |
|--------|---------|
| **URL Parameters** | `id` (UUID) |
| **Response** | Array of LeadInteraction objects with seller details |
| **Status Codes** | `200` Success, `404` Lead not found |

Example Response (200):

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "lead_id": "550e8400-e29b-41d4-a716-446655440000",
    "campaing_id": "770e8400-e29b-41d4-a716-446655440002",
    "notes": "Customer interested, follow up tomorrow",
    "type": "CALL",
    "created_by": "John David Doe",
    "created_at": "2026-04-08T11:00:00Z"
  }
]
```

---

**Create a Lead**

```
POST /api/leads
Content-Type: application/json
```

Creates a new lead with basic information.

Request Body:

```json
{
  "first_name": "Jane",
  "middle_name": "Marie",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "secondary_email": "jane.alt@example.com",
  "cellphone": "987654321",
  "profession": "Marketing Manager",
  "gender": "FEMALE",
  "address": "456 Oak Ave, Los Angeles",
  "second_address": null,
  "dni": "87654321",
  "moodle_user_id": null,
  "lead_status": "ACTIVE"
}
```

**Field Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `first_name` | string | Yes | Min 3 characters |
| `middle_name` | string | Yes | Min 3 characters |
| `last_name` | string | Yes | Min 3 characters |
| `email` | string | Yes | Valid email format, unique |
| `secondary_email` | string | No | Valid email format if provided |
| `cellphone` | string | No | 9 digits if provided |
| `profession` | string | No | Any text |
| `gender` | enum | No | MALE, FEMALE, NOT_SPECIFIED |
| `address` | string | No | Min 10 characters if provided |
| `second_address` | string | No | Min 10 characters if provided |
| `dni` | string | No | Exactly 8 digits, numeric only |

Example Response (201):

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "first_name": "Jane",
    "email": "jane.smith@example.com",
    "cellphone": "987654321",
    "created_at": "2026-04-08T12:00:00Z",
    "updated_at": "2026-04-08T12:00:00Z"
  }
}
```

---

**Create a Lead from External Source**

```
POST /api/leads/external
Content-Type: application/json
```

Creates a lead and automatically assigns it to a campaign with an initial interaction (e.g., from website form or social media).

Request Body:

```json
{
  "first_name": "Alex",
  "middle_name": "James",
  "last_name": "Johnson",
  "email": "alex.johnson@example.com",
  "cellphone": "912345678",
  "profession": "Data Analyst",
  "gender": "MALE",
  "address": "789 Pine Rd, Chicago",
  "dni": "11223344",
  "lead_interaction": {
    "notes": "New lead from website contact form",
    "type": "WEBSITE_FORM"
  },
  "source": "FACEBOOK",
  "campaing_id": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `(all lead fields)` | - | - | Same as Create Lead request |
| `lead_interaction` | object | Yes | Interaction to record (notes, type) |
| `source` | enum | Yes | Where lead came from: FACEBOOK, INSTAGRAM, TIKTOK, WHATSAPP, WEBSITE |
| `campaing_id` | UUID | Yes | Campaign to assign lead to |

---

**Update a Lead**

```
PUT /api/leads/:id
Content-Type: application/json
```

Updates one or more fields of an existing lead (partial update).

Request Body (example):

```json
{
  "lead_status": "INACTIVE",
  "profession": "Senior Data Analyst"
}
```

**Rules:**

- At least one field must be provided
- Only provided fields are updated
- Same validation rules as Create Lead apply

Status Codes: `200` Success, `404` Lead not found

---

### Orders API `/api/orders`

**Get All Orders**

```
GET /api/orders
```

Returns all orders with a default limit.

Example Response:

```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "lead_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_code": "ORD00001",
    "sub_total": 299.99,
    "total_amount": 279.99,
    "discount": 20.00,
    "order_status": "PENDING",
    "created_at": "2026-04-08T13:00:00Z",
    "updated_at": "2026-04-08T13:00:00Z"
  }
]
```

---

**Get Order Details**

```
GET /api/orders/:id
```

Returns detailed information including order items.

| Aspect | Details |
|--------|---------|
| **URL Parameters** | `id` (UUID) |
| **Response Includes** | Order object with `orderDetails` array |
| **Status Codes** | `200` Success, `404` Order not found |

Example Response (200):

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "lead_id": "550e8400-e29b-41d4-a716-446655440000",
  "order_code": "ORD00001",
  "sub_total": 299.99,
  "total_amount": 279.99,
  "discount": 20.00,
  "order_status": "PENDING",
  "orderDetails": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "product_id": "bb0e8400-e29b-41d4-a716-446655440006",
      "price": 299.99,
      "discount_code": null,
      "created_at": "2026-04-08T13:00:00Z"
    }
  ],
  "created_at": "2026-04-08T13:00:00Z"
}
```

---

**Create an Order**

```
POST /api/orders
Content-Type: application/json
```

Creates a new order with multiple products.

Request Body:

```json
{
  "lead_id": "550e8400-e29b-41d4-a716-446655440000",
  "generated_by": "seller_profile_user_id_here",
  "sub_total": 599.98,
  "total_amount": 559.98,
  "discount": 40.00,
  "order_items": [
    {
      "product_id": "bb0e8400-e29b-41d4-a716-446655440006",
      "price": 299.99,
      "discount_code": null
    },
    {
      "product_id": "cc0e8400-e29b-41d4-a716-446655440007",
      "price": 299.99,
      "discount_code": "SAVE20"
    }
  ]
}
```

**Field Validation:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `lead_id` | UUID | Yes | Must exist in database |
| `generated_by` | UUID | No | Seller profile user_id |
| `sub_total` | decimal | Yes | Must be positive |
| `total_amount` | decimal | Yes | Must be ≤ sub_total |
| `discount` | decimal | No | Default 0, must be ≥ 0 |
| `order_items` | array | Yes | Min 1 item, max unlimited |
| `order_items[].product_id` | UUID | Yes | Must exist |
| `order_items[].price` | decimal | Yes | Must be positive |
| `order_items[].discount_code` | string | No | Max 7 characters |

Response (201):

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "order_code": "ABC1234",
    "order_status": "PENDING",
    "orderDetails": [...]
  }
}
```

---

**Update an Order**

```
PUT /api/orders/:id
Content-Type: application/json
```

Updates order details and items.

Request Body (optional fields):

```json
{
  "total_amount": 499.98,
  "discount": 60.00,
  "order_status": "COMPLETED",
  "order_items": [
    {
      "product_id": "bb0e8400-e29b-41d4-a716-446655440006",
      "price": 249.99
    }
  ]
}
```

Status Codes: `200` Success, `404` Order not found

---

**Delete an Order**

```
DELETE /api/orders/:id
```

Deletes an order and its associated order details.

Status Codes: `200` Success, `404` Order not found

---

### Users API `/api/users`

**Get All Users**

```
GET /api/users
```

Returns all users with their role information (passwords excluded).

Example Response:

```json
[
  {
    "id": "dd0e8400-e29b-41d4-a716-446655440008",
    "first_name": "Carlos",
    "middle_name": "Luis",
    "last_name": "Romero",
    "email": "carlos.romero@company.com",
    "cellphone": "912345678",
    "is_active": true,
    "role": { "name": "SALES_REP" },
    "created_at": "2026-04-01T10:00:00Z"
  }
]
```

---

**Get User Details**

```
GET /api/users/:id
```

Returns detailed information for a specific user.

Status Codes: `200` Success, `404` User not found

---

**Get All Sellers**

```
GET /api/users/sellers
```

Returns all sales representatives with their profiles (sales target, max discount).

Example Response:

```json
[
  {
    "id": "ee0e8400-e29b-41d4-a716-446655440009",
    "user_id": "dd0e8400-e29b-41d4-a716-446655440008",
    "sales_target": 5000.00,
    "max_discount": 100.00,
    "first_name": "Carlos",
    "last_name": "Romero",
    "middle_name": "Luis"
  }
]
```

---

**Get Seller Details**

```
GET /api/users/sellers/:id
```

Returns detailed seller profile information.

| Aspect | Details |
|--------|---------|
| **URL Parameters** | Seller Profile ID (UUID) |
| **Response** | Seller profile with user details |
| **Status Codes** | `200` Success, `404` Seller not found |

---

**Create a User**

```
POST /api/users
Content-Type: application/json
```

Creates a new user account (staff member).

Request Body:

```json
{
  "first_name": "Maria",
  "middle_name": "Carmen",
  "last_name": "Garcia",
  "email": "maria.garcia@company.com",
  "cellphone": "923456789",
  "role_id": "role_uuid_here",
  "password": "SecurePassword123!"
}
```

**Field Validation:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `first_name` | string | Yes | Min 3 characters |
| `middle_name` | string | Yes | Min 3 characters |
| `last_name` | string | Yes | Min 3 characters |
| `email` | string | Yes | Valid email, unique |
| `cellphone` | string | No | 9 digits if provided |
| `role_id` | UUID | Yes | Must exist in roles table |
| `password` | string | Yes | Will be hashed with bcrypt |

Response (201): Created user object with success message

---

**Create Seller Profile**

```
POST /api/users/sellers
Content-Type: application/json
```

Creates a seller profile for an existing user.

Request Body:

```json
{
  "user_id": "dd0e8400-e29b-41d4-a716-446655440008",
  "sales_target": 10000.00,
  "max_discount": 500.00
}
```

**Field Validation:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `user_id` | UUID | Yes | Must exist, user must have SALES_REP role |
| `sales_target` | decimal | No | Default 0 |
| `max_discount` | decimal | No | Default 0 |

---

**Update User**

```
PUT /api/users/:id
Content-Type: application/json
```

Updates user information (partial update supported).

---

**Update Seller Profile**

```
PUT /api/users/sellers/:id
Content-Type: application/json
```

Updates seller information (sales target, max discount).

---

### Courses API `/api/courses`

**Get All Courses**

```
GET /api/courses
```

Returns all available courses.

---

**Get Course Details**

```
GET /api/courses/:id
```

Returns course information with all editions and modalities.

Example Response:

```json
{
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "id": "ff0e8400-e29b-41d4-a716-446655440010",
    "name": "Advanced Python Programming",
    "description": "Learn Python for data science and web development",
    "code": "PYTHON",
    "image_url": "https://example.com/python.jpg",
    "editions": [
      {
        "id": "11f0e840-0e29-b41d-4a71-6446655440011",
        "edition_number": 1,
        "start_date": "2026-05-01",
        "end_date": "2026-08-01",
        "modality": "Online",
        "edition_status": "OPEN",
        "moodle_course_id": 123
      }
    ]
  }
}
```

---

**Get All Course Editions**

```
GET /api/courses/editions
```

Returns all course editions with course and campaign information.

---

**Get Course Edition Details**

```
GET /api/courses/editions/:id
```

Returns detailed information for a specific course edition.

---

**Create Course**

```
POST /api/courses
Content-Type: application/json
```

Creates a new course.

Request Body:

```json
{
  "name": "Data Science Fundamentals",
  "description": "Introduction to data science concepts",
  "code": "DATSC1",
  "image_url": "https://example.com/datascience.jpg"
}
```

**Field Validation:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | Course title |
| `description` | string | No | Course description |
| `code` | string | Yes | Unique 7-character identifier |
| `image_url` | string | No | URL to course image |

---

**Create Course Edition**

```
POST /api/courses/editions
Content-Type: application/json
```

Creates a new edition (instance) of a course.

Request Body:

```json
{
  "course_id": "ff0e8400-e29b-41d4-a716-446655440010",
  "edition_number": 1,
  "start_date": "2026-05-01",
  "end_date": "2026-08-01",
  "modality_id": "modality_uuid",
  "moodle_course_id": 123,
  "teacher_fullname": "Dr. Jane Smith",
  "meet_link": "https://meet.google.com/xxx-yyyy-zzz",
  "edition_status": "DRAFT"
}
```

**Field Validation:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `course_id` | UUID | Yes | Must exist |
| `edition_number` | integer | Yes | Sequential edition number |
| `start_date` | date | Yes | Format: YYYY-MM-DD |
| `end_date` | date | Yes | Must be after start_date |
| `modality_id` | UUID | Yes | Online, In-Person, Hybrid, etc |
| `edition_status` | enum | No | DRAFT, OPEN, IN_PROGRESS, COMPLETED, SCHEDULED |

---

### Products API `/api/products`

**Get All Products**

```
GET /api/products
```

Returns all products (pricing for course editions).

---

**Get Product Details**

```
GET /api/products/:id
```

Returns detailed product information.

Example Response:

```json
{
  "success": true,
  "data": {
    "id": "22g0e840-0e29-b41d-4a71-6446655440012",
    "edition_id": "11f0e840-0e29-b41d-4a71-6446655440011",
    "slug": "python-advanced-course",
    "description": "Advanced Python programming course",
    "short_description": "Learn advanced Python techniques",
    "category": "Programming",
    "cash_price": 299.99,
    "installment_price": 99.99,
    "discount_price": 249.99,
    "discount_expires_at": "2026-05-30",
    "sales_status": "ON_SALE",
    "created_at": "2026-04-08T14:00:00Z"
  }
}
```

---

**Create Product**

```
POST /api/products
Content-Type: application/json
```

Creates a new product (pricing for a course edition).

Request Body:

```json
{
  "edition_id": "11f0e840-0e29-b41d-4a71-6446655440011",
  "slug": "python-advanced-2026",
  "description": "Advanced Python programming with frameworks",
  "short_description": "Learn Django and FastAPI",
  "category": "Programming",
  "cash_price": 399.99,
  "installment_price": 149.99,
  "discount_price": 349.99,
  "discount_expires_at": "2026-05-30",
  "sales_status": "DRAFT"
}
```

**Field Validation:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `edition_id` | UUID | Yes | Must exist |
| `category` | string | Yes | Product category |
| `cash_price` | decimal | Yes | Must be positive |
| `installment_price` | decimal | Yes | Must be positive |
| `discount_price` | decimal | No | Default 0 |
| `sales_status` | enum | No | DRAFT, PUBLISHED, ON_SALE, COMPLETED, CANCELLED |

---

**Update Product**

```
PUT /api/products/:id
Content-Type: application/json
```

Updates product pricing and details (partial update).

---

**Delete Product**

```
DELETE /api/products/:id
```

Removes a product from the system.

---

### Campaigns API `/api/campaings`

**Get All Campaigns**

```
GET /api/campaings
```

Returns all marketing campaigns.

---

**Get Campaign Details**

```
GET /api/campaings/:id
```

Returns detailed campaign information with edition and course data.

Example Response:

```json
{
  "success": true,
  "data": {
    "id": "33h0e840-0e29-b41d-4a71-6446655440013",
    "campaing_name": "Python Q2 2026 Campaign",
    "initial_budget": 5000.00,
    "total_spent": 2350.00,
    "status": "ACTIVE",
    "platform": "FACEBOOK",
    "is_organic": false,
    "start_date": "2026-04-01T00:00:00Z",
    "end_date": "2026-06-30T00:00:00Z",
    "edition": {
      "id": "11f0e840-0e29-b41d-4a71-6446655440011",
      "edition_code": "PYTHON-2026-1",
      "edition_status": "OPEN",
      "course": { "id": "...", "name": "Advanced Python Programming" }
    }
  }
}
```

---

**Create Campaign**

```
POST /api/campaings
Content-Type: application/json
```

Creates a new marketing campaign.

Request Body:

```json
{
  "campaing_name": "Summer Java Bootcamp 2026",
  "initial_budget": 8000.00,
  "status": "ACTIVE",
  "platform": "INSTAGRAM",
  "is_organic": false,
  "start_date": "2026-06-01T00:00:00Z",
  "end_date": "2026-08-31T00:00:00Z",
  "edition_id": "11f0e840-0e29-b41d-4a71-6446655440011"
}
```

**Field Validation:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `campaing_name` | string | Yes | Campaign name |
| `initial_budget` | decimal | Yes | Must be positive |
| `platform` | enum | Yes | FACEBOOK, INSTAGRAM, TIKTOK, WEBSITE |
| `status` | enum | Yes | ACTIVE, INACTIVE, PAUSED |
| `edition_id` | UUID | Yes | Must exist, one campaign per edition |

---

**Update Campaign**

```
PUT /api/campaings/:id
Content-Type: application/json
```

Updates campaign details (partial update).

---

**Delete Campaign**

```
DELETE /api/campaings/:id
```

Removes a campaign from the system.

---

### Payments API `/api/payments`

**Get All Payments**

```
GET /api/payments
```

Returns all payment records sorted by date (newest first).

Example Response:

```json
[
  {
    "id": "44i0e840-0e29-b41d-4a71-6446655440014",
    "order_id": "990e8400-e29b-41d4-a716-446655440004",
    "payment_date": "2026-04-08T15:30:00Z",
    "amount": 279.99,
    "payment_method": "ONLINE",
    "payment_status": "CONFIRMED",
    "type": "FULL",
    "currency": "USD",
    "transaccion_id": "TXN123456789",
    "created_at": "2026-04-08T15:30:00Z"
  }
]
```

---

**Create Manual Payment**

```
POST /api/payments/manual
Content-Type: application/json
```

Records a payment manually (cash, transfer, POS, etc.) and optionally creates a payment plan for installments.

Request Body (for full payment):

```json
{
  "order_id": "990e8400-e29b-41d4-a716-446655440004",
  "payment_date": "2026-04-08T15:30:00Z",
  "amount": 279.99,
  "payment_method": "BANK_TRANSFER",
  "payment_status": "CONFIRMED",
  "type": "FULL",
  "currency": "USD",
  "transaccion_id": "TXN123456789"
}
```

Request Body (for installment payments):

```json
{
  "order_id": "990e8400-e29b-41d4-a716-446655440004",
  "payment_date": "2026-04-08T15:30:00Z",
  "amount": 93.33,
  "payment_method": "CASH",
  "payment_status": "CONFIRMED",
  "type": "INSTALLMENTS",
  "currency": "USD",
  "payment_plan": {
    "total_installments": 3,
    "total_amount": 279.99,
    "start_date": "2026-04-08T00:00:00Z",
    "payment_plan_status": "PENDING",
    "scheduled_payments": [
      {
        "number": 1,
        "amount": 93.33,
        "due_date": "2026-04-08T00:00:00Z",
        "status": "PENDING"
      },
      {
        "number": 2,
        "amount": 93.33,
        "due_date": "2026-05-08T00:00:00Z",
        "status": "PENDING"
      },
      {
        "number": 3,
        "amount": 93.33,
        "due_date": "2026-06-08T00:00:00Z",
        "status": "PENDING"
      }
    ]
  }
}
```

**Field Validation:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `order_id` | UUID | Yes | Must exist |
| `payment_date` | datetime | Yes | ISO 8601 format |
| `amount` | decimal | Yes | Must be positive |
| `payment_method` | enum | Yes | CASH, BANK_TRANSFER, ONLINE, POS, YAPE |
| `payment_status` | enum | Yes | PENDING, CONFIRMED, FAILED, REFUNDED |
| `type` | enum | Yes | FULL or INSTALLMENTS |
| `currency` | string | No | Default: USD |
| `transaccion_id` | string | No | External payment gateway ID |
| `payment_plan` | object | If type=INSTALLMENTS | Payment plan details with scheduled payments |

Response (201):

```json
{
  "success": true,
  "message": "New payment created successfully",
  "data": {
    "id": "44i0e840-0e29-b41d-4a71-6446655440014",
    "order_id": "990e8400-e29b-41d4-a716-446655440004",
    "amount": 279.99,
    "payment_status": "CONFIRMED"
  }
}
```

---

## Request & Response Format

### Response Structure

All API responses follow a standardized format:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Response data object (varies by endpoint)
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error description",
  "isFormError": false
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | OK | Successful GET, PUT, DELETE request |
| `201` | Created | Successful POST that creates a resource |
| `400` | Bad Request | Invalid input, validation failure |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate entry (e.g., unique email) |
| `500` | Server Error | Internal server error |

### Response Time

- **Development**: Typically < 100ms for simple queries
- **Production**: Typically < 50ms for cached queries

---

## Database Models

### Core Tables Overview

```
Leads (prospects)
├─ Phones (contact numbers)
├─ CampaignMembers (campaign assignments)
├─ LeadInteractions (sales touchpoints)
└─ Orders (purchases)

Orders
├─ OrderDetails (line items)
├─ Payments (payment records)
└─ PaymentPlans (installment schedules)

Courses
├─ Editions (course instances)
│  └─ Products (pricing)
│  └─ Campaigns (marketing)
└─ Modalities (delivery types)

Users
├─ SellerProfiles (sales reps)
└─ MarketingProfiles (marketers)
```

### Table Relationships

#### Lead

Represents a potential or actual customer.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `first_name` | string | Required, min 3 chars |
| `middle_name` | string | Required, min 3 chars |
| `last_name` | string | Required, min 3 chars |
| `email` | string | Unique, required |
| `secondary_email` | string | Optional |
| `cellphone` | string | 9 digits, optional |
| `profession` | string | Optional |
| `gender` | enum | MALE, FEMALE, NOT_SPECIFIED |
| `address` | string | Min 10 chars, optional |
| `dni` | string | 8-digit ID, unique, optional |
| `moodle_user_id` | integer | Moodle system user ID, optional |
| `lead_status` | enum | ACTIVE, INACTIVE |
| `primary_campaign_id` | UUID | Foreign key to Campaign |
| `created_at` | datetime | Auto-set |
| `updated_at` | datetime | Auto-updated |

**Relationships:**

- 1 Lead → Many LeadPhones
- 1 Lead → Many CampaignMembers
- 1 Lead → Many LeadInteractions
- 1 Lead → Many Orders

---

#### LeadPhone

Contact phone numbers for leads.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `number` | string | Phone number |
| `type` | enum | WHATSAPP, TELEPHONE |
| `lead_id` | UUID | Foreign key to Lead |

---

#### CampaignMember

Association of a lead with a campaign (for multi-campaign tracking).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key |
| `campaing_id` | UUID | Foreign key |
| `status` | enum | NEW, CONTACTED, QUALIFIED, ..., WON, LOST |
| `assigned_to` | UUID | Seller Profile ID, optional |
| `source` | enum | FACEBOOK, INSTAGRAM, TIKTOK, WHATSAPP, WEBSITE |
| `is_primary` | boolean | Is this the primary campaign? |
| `created_at` | datetime | Auto-set |
| `updated_at` | datetime | Auto-updated |

**Unique Constraint:** (lead_id, campaing_id)

**Indexes:** status, assigned_to

---

#### LeadInteraction

Recorded interaction with a lead (sale call, email, etc.).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key |
| `notes` | string | Interaction notes, max 255 chars |
| `created_by` | UUID | Seller Profile ID, who recorded this |
| `campaing_id` | UUID | Foreign key to CampaignMember |
| `type` | enum | WEBSITE_FORM, SELL, WHATSAPP, EMAIL, MEETING, CALL |

---

#### Order

Customer purchase order.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to Lead |
| `generated_by` | UUID | Seller Profile user_id, optional |
| `sub_total` | decimal | Sum of all items |
| `total_amount` | decimal | After discount |
| `discount` | decimal | Discount amount |
| `order_status` | enum | PENDING, COMPLETED, CANCELLED, REFUNDED |
| `order_code` | string | Unique 7-char code (e.g., ABC1234) |
| `created_at` | datetime | Auto-set |
| `updated_at` | datetime | Auto-updated |

**Relationships:**

- 1 Order → Many OrderDetails (line items)
- 1 Order → Many Payments
- 1 Order → Many PaymentPlans

**Indexes:** lead_id, order_status

---

#### OrderDetail

Individual line item in an order.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `product_id` | UUID | Foreign key |
| `price` | decimal | Price at time of order |
| `order_id` | UUID | Foreign key |
| `discount_code` | string | Applied code, optional |
| `created_at` | datetime | Auto-set |

---

#### Payment

Payment transaction record.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `order_id` | UUID | Foreign key |
| `scheduled_payment_id` | UUID | If part of plan, optional |
| `payment_date` | datetime | When payment was made |
| `amount` | decimal | Payment amount |
| `payment_method` | enum | CASH, BANK_TRANSFER, ONLINE, POS, YAPE |
| `payment_status` | enum | PENDING, CONFIRMED, FAILED, REFUNDED |
| `type` | enum | FULL or INSTALLMENTS |
| `currency` | string | ISO code, e.g., USD |
| `transaccion_id` | string | Payment gateway ID, optional |
| `created_at` | datetime | Auto-set |
| `updated_at` | datetime | Auto-updated |

**Indexes:** payment_status

---

#### PaymentPlan

Installment payment plan for an order.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `order_id` | UUID | Foreign key |
| `total_installments` | integer | Number of installments |
| `total_amount` | decimal | Total to be paid |
| `start_date` | datetime | Plan start date |
| `plan_status` | enum | PENDING, COMPLETED, CANCELLED |

---

#### ScheduledPayment

Individual installment within a payment plan.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `payment_plan_id` | UUID | Foreign key |
| `number` | integer | Installment number (1, 2, 3...) |
| `amount` | decimal | Installment amount |
| `due_date` | datetime | When payment is due |
| `status` | enum | PENDING, COMPLETED, OVERDUE, FAILED |

**Unique Constraint:** (payment_plan_id, number)

---

#### Course

Course definition (e.g., Python Programming).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | string | Course name |
| `description` | string | Course description, optional |
| `image_url` | string | Course image, optional |
| `code` | string | Unique 7-char code (e.g., PYTHON) |

**Relationships:**

- 1 Course → Many Editions

---

#### Edition

Instance of a course (e.g., Python Q1 2026).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `course_id` | UUID | Foreign key |
| `edition_number` | integer | Sequential (1, 2, 3...) |
| `start_date` | date | Course start |
| `end_date` | date | Course end |
| `modality_id` | UUID | Foreign key to Modality |
| `moodle_course_id` | integer | Moodle course ID, optional |
| `teacher_fullname` | string | Instructor name |
| `meet_link` | string | Virtual meeting link, optional |
| `edition_status` | enum | DRAFT, OPEN, IN_PROGRESS, COMPLETED, SCHEDULED, CANCELLED |
| `edition_code` | string | Unique code (e.g., PYTHON-2026-1) |
| `created_at` | datetime | Auto-set |
| `updated_at` | datetime | Auto-updated |

**Relationships:**

- 1 Edition → Many Products
- 1 Edition ← 1 Campaign

---

#### Product

Pricing tier for a course edition.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `edition_id` | UUID | Foreign key |
| `slug` | string | URL slug, optional |
| `description` | string | Product description, optional |
| `short_description` | string | Short description, optional |
| `category` | string | Product category |
| `cash_price` | decimal | Full price upfront |
| `installment_price` | decimal | Monthly installment |
| `discount_price` | decimal | Discounted price, optional |
| `discount_expires_at` | datetime | When discount ends, optional |
| `sales_status` | enum | DRAFT, PUBLISHED, ON_SALE, COMPLETED, CANCELLED |
| `created_at` | datetime | Auto-set |
| `updated_at` | datetime | Auto-updated |

**Relationships:**

- 1 Product → Many OrderDetails

---

#### Campaign

Marketing campaign for an edition.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `campaing_name` | string | Campaign name |
| `initial_budget` | decimal | Total campaign budget |
| `total_spent` | decimal | Amount spent, optional |
| `status` | enum | ACTIVE, INACTIVE, PAUSED |
| `start_date` | datetime | Campaign start |
| `end_date` | datetime | Campaign end, optional |
| `platform` | enum | FACEBOOK, INSTAGRAM, TIKTOK, WEBSITE |
| `is_organic` | boolean | Is organic (non-paid) |
| `edition_id` | UUID | Foreign key (unique) |
| `created_at` | datetime | Auto-set |
| `updated_at` | datetime | Auto-updated |

**Relationships:**

- 1 Campaign → Many CampaignMembers
- 1 Campaign ← 1 Edition (unique)

---

#### User

System user (staff member).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `first_name` | string | Required |
| `middle_name` | string | Required |
| `last_name` | string | Required |
| `email` | string | Unique, optional |
| `cellphone` | string | 9 digits, optional |
| `role_id` | UUID | Foreign key to Role |
| `is_active` | boolean | Account status |
| `password` | string | Hashed password |
| `created_at` | datetime | Auto-set |
| `updated_at` | datetime | Auto-updated |

**Relationships:**

- 1 User → 1 SellerProfile (optional)
- 1 User → 1 MarketingProfile (optional)

---

#### Role

System roles with permissions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | enum | SALES_REP, MARKETING, ADMIN, SALES_SUPERVISOR, COLLECTIONS |
| `description` | string | Optional |
| `is_active` | boolean | Is active |

**Available Roles:**

- `SALES_REP` — Can manage leads, create orders, record payments
- `MARKETING` — Can create campaigns, manage editions
- `SALES_SUPERVISOR` — Oversees sales reps, approves discounts
- `ADMIN` — Full system access
- `COLLECTIONS` — Manages payments and collections

---

#### SellerProfile

Sales representative profile.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key (unique) |
| `sales_target` | integer | Monthly sales target |
| `max_discount` | decimal | Maximum discount allowed |

**Relationships:**

- 1 SellerProfile → Many CampaignMembers
- 1 SellerProfile → Many Orders
- 1 SellerProfile → Many LeadInteractions

---

### Entity Relationship Diagram (Text-based)

```
┌─────────────────┐
│   Lead          │
├─────────────────┤
│ id (PK)         │
│ first_name      │
│ email (UNIQUE)  │
│ created_at      │
└────────┬────────┘
         │
         ├──────→ LeadPhone (1:N)
         │
         ├──────→ CampaignMember (1:N) ──→ Campaign (1:1)
         │           │
         │           └──→ SellerProfile (0:1)
         │
         ├──────→ LeadInteraction (1:N)
         │           │
         │           └──→ SellerProfile (0:1)
         │
         └──────→ Order (1:N)
                      │
                      ├──→ OrderDetail (1:N)
                      │       │
                      │       └──→ Product (1:1)
                      │           │
                      │           └──→ Edition (1:1)
                      │               │
                      │               ├──→ Course (1:1)
                      │               └──→ Modality (1:1)
                      │
                      ├──→ Payment (1:N)
                      │       └──→ ScheduledPayment (0:N)
                      │
                      └──→ PaymentPlan (0:1)
                              └──→ ScheduledPayment (1:N)

┌──────────────┐
│    User      │
├──────────────┤
│ id (PK)      │
│ email        │
│ role_id (FK) │
└──────┬───────┘
       │
       ├──→ SellerProfile (0:1)
       │
       └──→ MarketingProfile (0:1)


┌──────────────┐
│     Role     │
├──────────────┤
│ id (PK)      │
│ name (ENUM)  │
└──────────────┘
```

---

## Error Handling

### Error Response Format

All errors follow a standardized format:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "isFormError": true
}
```

### Common Error Scenarios

#### Validation Error (400 Bad Request)

**Cause:** Request body fails Zod validation

```json
{
  "success": false,
  "error": "Invalid input: email must be a valid email address",
  "isFormError": true
}
```

**Solution:** Verify all required fields are provided and match the required format.

---

#### Resource Not Found (404 Not Found)

**Cause:** Requested resource doesn't exist

```json
{
  "success": false,
  "error": "Lead not found"
}
```

**Solution:** Verify the resource ID and ensure it exists in the database.

---

#### Duplicate Entry (409 Conflict)

**Cause:** Unique constraint violation (e.g., duplicate email)

```json
{
  "success": false,
  "error": "A lead with this email already exists"
}
```

**Solution:** Use a different value for unique fields (email, DNI, etc.)

---

#### Server Error (500 Internal Server Error)

**Cause:** Unexpected server error

Development response:

```json
{
  "success": false,
  "error": "Error stack trace here..."
}
```

Production response:

```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

**Solution:** Check server logs and contact support.

---

### Error Codes by Feature

| Feature | Error | Status | Meaning |
|---------|-------|--------|---------|
| Lead | Lead not found | 404 | Lead ID doesn't exist |
| Order | Order not found | 404 | Order ID doesn't exist |
| User | User not found | 404 | User ID doesn't exist |
| Seller | Seller not found | 404 | Seller profile doesn't exist |
| Course | Course not found | 404 | Course ID doesn't exist |
| Product | Product not found | 404 | Product ID doesn't exist |
| Campaign | Campaign not found | 404 | Campaign ID doesn't exist |
| All | Validation failed | 400 | Invalid request body |
| All | Internal error | 500 | Server error |

---

## Best Practices

### API Usage

1. **Always include Content-Type header** when sending JSON:
   ```
   Content-Type: application/json
   ```

2. **Use HTTP methods correctly:**
   - `GET` — Retrieve data (safe, idempotent)
   - `POST` — Create new data (idempotent key recommended)
   - `PUT` — Update existing data (idempotent)
   - `DELETE` — Remove data (idempotent)

3. **Validate client-side** before sending requests to reduce round trips

4. **Handle errors gracefully:** Always check `success` field in responses

5. **Respect rate limits:** Cache responses when possible

### Data Validation

1. **Email validation:**
   - Must be valid email format
   - Must be unique in system
   - Case-insensitive comparisons recommended

2. **Phone validation:**
   - 9 digits for Peruvian numbers (cellphone)
   - Format without special characters

3. **DNI (National ID) validation:**
   - Exactly 8 numeric digits
   - Must be unique
   - Validate checksum in future versions

4. **Decimal fields (prices):**
   - Use `decimal(10, 2)` precision
   - Always positive for prices
   - Handle rounding carefully in calculations

### Workflow Recommendations

1. **Lead Creation:**
   - Always include first_name, middle_name, last_name, email
   - Normalize phone numbers before storage
   - Use `createLeadFromExternal` when lead comes from external source

2. **Order Creation:**
   - Always validate product IDs before creating order
   - Verify quantities and prices match current products
   - Test discount calculations

3. **Payment Recording:**
   - Always confirm payment method with customer
   - For installments, create PaymentPlan first
   - Update order status after confirming payment

4. **Campaign Management:**
   - Link campaign to one edition only
   - Set realistic budget and tracking
   - Track platform-specific performance separately

### Performance Tips

1. **Use indexes** on frequently queried fields (status, assigned_to, etc.)
2. **Implement pagination** for endpoints returning large datasets
3. **Cache campaign/course data** as it changes infrequently
4. **Batch operations** when processing multiple items
5. **Monitor query performance** using Prisma Studio

---

## Development & Deployment

### Development Tools

**Prisma Studio** — Visual database manager:

```bash
bun run prisma:studio
```

Opens at `http://localhost:5555`

**ESLint** — Code quality checks:

```bash
bun run lint          # Check for issues
bun run lint:fix      # Auto-fix issues
```

**Circular Dependency Detection:**

```bash
bun run detect-cycles
```

### Script Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `bun run dev` | Development with hot reload |
| `start` | `bun run start` | Production server |
| `migrate` | `bun run migrate` | Create/run migrations |
| `reset-db` | `bun run reset-db` | Reset database |
| `prisma:generate` | `bun run prisma:generate` | Generate Prisma Client |
| `prisma:push` | `bun run prisma:push` | Push schema to DB (no migration) |
| `prisma:migrate` | `bun run prisma:migrate` | Create migration |
| `prisma:deploy` | `bun run prisma:deploy` | Deploy migrations |
| `prisma:seed` | `bun run prisma:seed` | Seed database |
| `prisma:studio` | `bun run prisma:studio` | Open Prisma Studio |
| `db:setup` | `bun run db:setup` | Full setup (generate + push + seed) |
| `lint` | `bun run lint` | Check code |
| `lint:fix` | `bun run lint:fix` | Fix linting issues |

### Deployment Checklist

Before deploying to production:

- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] ESLint checks passed (`bun run lint`)
- [ ] Test key endpoints manually
- [ ] Error logs monitored
- [ ] Prisma Client generated (`bun run prisma:generate`)
- [ ] JWT_SECRET and PAYMENT_WEBHOOK_SECRET set to strong values
- [ ] EMAIL credentials verified (if notifications enabled)
- [ ] MOODLE_TOKEN verified (if Moodle integration active)

### Deployment Platforms

**Vercel (Recommended):**

```bash
vercel deploy
```

Configuration: See `vercel.json`

**Docker:**

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --production
COPY src ./src
COPY prisma ./prisma
RUN bun run prisma:generate
EXPOSE 5000
CMD ["bun", "run", "start"]
```

Build and run:

```bash
docker build -t moodle-enrollment-api .
docker run -p 5000:5000 --env-file .env moodle-enrollment-api
```

### Monitoring & Logs

- Monitor `/api` endpoint response times
- Log all payment transactions for audit trail
- Track error rate by endpoint
- Alert on payment failures
- Monitor database connection pool

---

## Support & Resources

### Documentation

- [Hono Docs](https://hono.dev/docs/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Zod Docs](https://zod.dev/)
- [Bun Docs](https://bun.sh/docs)

### API Tools

- **Postman** — Import API collection for testing
- **Insomnia** — Alternative REST client
- **cURL** — Command line API testing
- **VS Code REST Client** — Lightweight testing extension

### Common Issues

**"Database connection refused"**
- Verify DATABASE_HOST and DATABASE_PORT
- Ensure MySQL/MariaDB service is running
- Check credentials in .env

**"Prisma Client not generated"**
- Run `bun run prisma:generate`
- Check for schema.prisma syntax errors

**"Port already in use"**
- Change PORT in .env
- Or kill process: `kill -9 $(lsof -t -i:5000)`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Apr 2026 | Initial release with core features |
| 1.1.0 (planned) | Jun 2026 | Pagination, advanced filtering, webhooks |

---

## License

MIT License — See `LICENSE` file for details.

---

## Questions?

For issues, questions, or contributions:

1. Check existing documentation
2. Review Prisma/Hono official docs
3. Check `.env.local` for configuration examples
4. Enable debug logging by setting `DEBUG=*`

---

**Last Updated:** April 8, 2026  
**Maintainer:** Development Team  
**Status:** ✅ Production Ready