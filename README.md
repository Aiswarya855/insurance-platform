# Insurance Platform API

A backend REST API for an insurance platform built with **Node.js, Express.js, TypeScript, Prisma ORM, and SQLite**. This project demonstrates authentication, role-based authorization, insurance workflows, payment status handling, webhook signature verification, and automated API testing.

## Features

- User registration and login using JWT authentication
- Password hashing with bcryptjs
- Role-based access control for customer and admin users
- Insurance product management
- Insurance quote generation
- Policy creation and management
- Payment initiation and status tracking
- HMAC-SHA256 signed payment webhook verification
- Duplicate webhook event handling
- Admin dashboard with user, product, quote, policy, and payment statistics
- Centralized database access using Prisma ORM
- Security middleware using Helmet
- Automated API tests using Jest and Supertest

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- JWT (`jsonwebtoken`)
- bcryptjs
- Axios
- Helmet
- CORS
- Jest
- Supertest

## Prerequisites

- Node.js and npm
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Aiswarya855/insurance-platform.git
cd insurance-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root, using `.env.example` as a reference.

Configure the required values:

```dotenv
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET=your_unique_jwt_secret
WEBHOOK_SECRET=your_unique_webhook_secret
```

Use strong, unique secret values for your local environment. Never commit your real `.env` file or database file to GitHub.

### 4. Set up the database

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply the existing database migrations:

```bash
npx prisma migrate deploy
```

These commands assume the project's Prisma configuration and migration files are present and correctly configured.

### 5. Build the project

```bash
npm run build
```

### 6. Run automated tests

```bash
npm test
```

The current test suite checks the API health endpoint, product listing, invalid login credentials, and rejection of an empty product request.

### 7. Start the application

Production mode:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

The API uses port `5000` by default. Visit `http://localhost:5000/` to check the API health endpoint.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/users/register` | Register a user |
| POST | `/api/users/login` | Log in and receive a token |
| GET | `/api/products` | List insurance products |
| POST | `/api/products` | Create a product |
| POST | `/api/quotes` | Generate an insurance quote |
| POST | `/api/policies` | Create a policy from a quote |
| POST | `/api/payments` | Initiate a payment |
| POST | `/api/webhooks/payment` | Process a signed payment webhook |
| GET | `/api/admin/dashboard` | Retrieve dashboard statistics |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/quotes` | List quotes |
| GET | `/api/admin/policies` | List policies |
| GET | `/api/admin/payments` | List payments |

Protected endpoints require a valid Bearer token. Admin endpoints require the `ADMIN` role.

## Payment Webhook

The payment webhook verifies an HMAC-SHA256 signature before processing an event. It validates transaction and policy details and handles duplicate event processing to help prevent repeated updates.

**Demo limitation:** This project uses a simulated payment webhook. It is not connected to a live payment gateway and should not be treated as a production payment system.

## Testing and Build Verification

Automated tests are written using Jest and Supertest.

Run the test suite:

```bash
npm test
```

Check TypeScript compilation:

```bash
npm run build
```

The current test suite contains four passing tests. These tests cover selected API behaviours; they do not represent complete application test coverage.

## Future Improvements

- Expand automated tests for authentication, quotes, policies, payments, and webhooks
- Add API documentation using Swagger/OpenAPI
- Integrate a real payment gateway
- Add pagination and filtering to admin listing endpoints
- Configure continuous integration with GitHub Actions
- Deploy with secure production environment configuration
