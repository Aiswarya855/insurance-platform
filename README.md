# Insurance Platform API

A backend REST API for an insurance platform built with Node.js, Express, TypeScript, Prisma ORM, and SQLite.

## Features

- User registration and login using JWT authentication
- Password hashing with bcrypt
- Role-based access control for customer and admin users
- Insurance product management
- Insurance quote generation
- Policy creation and management
- Payment initiation and status tracking
- HMAC-SHA256 signed payment webhook verification
- Admin dashboard with user, product, quote, policy, and payment statistics
- Centralized database access using Prisma ORM
- Security middleware using Helmet

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite
- JWT
- bcryptjs
- Axios
- Helmet
- CORS

## Prerequisites

- Node.js and npm
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd insurance-platform
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root using `.env.example` as a reference.

Set your own strong, unique values for `JWT_SECRET` and `WEBHOOK_SECRET`. Never commit your real `.env` file.

### 4. Set up the database

```bash
npx prisma migrate deploy
```

### 5. Build the project

```bash
npm run build
```

### 6. Start the application

```bash
npm start
```

For development:

```bash
npm run dev
```

The API runs on port `5000` by default.

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

The payment webhook verifies an HMAC-SHA256 signature before processing the event. It checks the transaction and policy details and prevents duplicate event processing.

**Note:** This is a learning/demo project. The payment flow uses a simulated webhook and is not connected to a live payment gateway.

## Testing

The project has been manually tested using API requests, including registration, login, quote creation, policy creation, payment initiation, webhook verification, and admin endpoints.

TypeScript checks and the production build have also been verified.

## Future Improvements

- Automated unit and integration tests
- API documentation with Swagger/OpenAPI
- Integration with a real payment gateway
- Pagination and filtering for admin listing endpoints
- Deployment with production environment configuration
