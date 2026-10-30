
import request from "supertest";
import app from "../app";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/prisma";

describe("GET /", () => {
    it("should return API running message", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Insurance Platform API is running",
        });
    });
});

describe("GET /api/products", () => {
    it("should return products successfully", async () => {
        const response = await request(app).get("/api/products");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});

describe("POST /api/users/login", () => {
    it("should reject invalid login credentials", async () => {
        const response = await request(app)
            .post("/api/users/login")
            .send({
                email: "invalid-user@example.com",
                password: "WrongPassword123!",
            });

        expect(response.status).toBe(401);
    });
});

describe("POST /api/products", () => {
    it("should reject a product with missing required fields", async () => {
        const response = await request(app)
            .post("/api/products")
            .send({});

        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
    });
});

describe("JWT authentication", () => {
    it("should reject requests without an authentication token", async () => {
        const response = await request(app)
            .get("/api/admin/users");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it("should reject requests with an invalid authentication token", async () => {
        const response = await request(app)
            .get("/api/admin/users")
            .set("Authorization", "Bearer invalid.token.value");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });
});

describe("Admin authorization", () => {
    it("should reject a valid token with a non-admin role", async () => {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET is not configured for tests");
        }

        const token = jwt.sign(
            {
                userId: 999,
                role: "USER",
            },
            secret,
            {
                algorithm: "HS256",
                expiresIn: "5m",
            }
        );

        const response = await request(app)
            .get("/api/admin/users")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Access denied");
    });
});

describe("Payment webhook signature and processing", () => {
    let testUserId: number;
    let testProductId: number;
    let testQuoteId: number;
    let testPolicyId: number;
    let testPaymentId: number;

    let payload: {
        event: string;
        eventId: string;
        transactionId: string;
        policyId: number;
        amount: number;
        status: string;
    };

    beforeAll(async () => {
        // Create test user
        const user = await prisma.user.create({
            data: {
                name: "Webhook Test User",
                email: `webhook-test-${Date.now()}@example.com`,
                password: "test-password-hash",
            },
        });

        testUserId = user.id;

        // Create test product
        const product = await prisma.product.create({
            data: {
                name: "Webhook Test Product",
                category: "MOTOR",
                description: "Product created for webhook testing",
                basePrice: 10000,
            },
        });

        testProductId = product.id;

        // Create test quote
        const quote = await prisma.quote.create({
            data: {
                userId: testUserId,
                productId: testProductId,
                coverageAmount: 100000,
                premium: 9000,
            },
        });

        testQuoteId = quote.id;

        // Create test policy
        const policy = await prisma.policy.create({
            data: {
                policyNumber: `TEST-POLICY-${Date.now()}`,
                userId: testUserId,
                productId: testProductId,
                quoteId: testQuoteId,
                premium: 9000,
                startDate: new Date(),
                endDate: new Date(
                    new Date().setFullYear(new Date().getFullYear() + 1)
                ),
            },
        });

        testPolicyId = policy.id;

        // Create pending payment
        const payment = await prisma.payment.create({
            data: {
                policyId: testPolicyId,
                transactionId: `TEST-TXN-${Date.now()}`,
                amount: 9000,
                status: "PENDING",
            },
        });

        testPaymentId = payment.id;

        // Webhook payload
        payload = {
            event: "payment.success",
            eventId: `TEST-EVENT-${Date.now()}`,
            transactionId: payment.transactionId,
            policyId: testPolicyId,
            amount: 9000,
            status: "SUCCESS",
        };
    });

    afterAll(async () => {
        // Delete only records created by this test
        if (testPaymentId) {
            await prisma.payment.deleteMany({
                where: { id: testPaymentId },
            });
        }

        if (testPolicyId) {
            await prisma.policy.deleteMany({
                where: { id: testPolicyId },
            });
        }

        if (testQuoteId) {
            await prisma.quote.deleteMany({
                where: { id: testQuoteId },
            });
        }

        if (testProductId) {
            await prisma.product.deleteMany({
                where: { id: testProductId },
            });
        }

        if (testUserId) {
            await prisma.user.deleteMany({
                where: { id: testUserId },
            });
        }
    });

    const createSignature = (body: object) => {
        const secret = process.env.WEBHOOK_SECRET;

        if (!secret) {
            throw new Error("WEBHOOK_SECRET is not configured for tests");
        }

        return crypto
            .createHmac("sha256", secret)
            .update(JSON.stringify(body))
            .digest("hex");
    };

    it("should reject a webhook without a signature", async () => {
        const response = await request(app)
            .post("/api/webhooks/payment")
            .send(payload);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Webhook signature missing");
    });

    it("should reject a webhook with an invalid signature", async () => {
        const response = await request(app)
            .post("/api/webhooks/payment")
            .set("x-webhook-signature", "invalid-signature")
            .send(payload);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid webhook signature");
    });

    it("should process a webhook with a valid signature", async () => {
        const signature = createSignature(payload);

        const response = await request(app)
            .post("/api/webhooks/payment")
            .set("x-webhook-signature", signature)
            .send(payload);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            "Payment webhook processed successfully"
        );

        // Verify payment status in database
        const updatedPayment = await prisma.payment.findUnique({
            where: { id: testPaymentId },
        });

        expect(updatedPayment?.status).toBe("SUCCESS");
        expect(updatedPayment?.eventId).toBe(payload.eventId);

        // Verify policy status in database
        const updatedPolicy = await prisma.policy.findUnique({
            where: { id: testPolicyId },
        });

        expect(updatedPolicy?.status).toBe("ACTIVE");
    });

    it("should not process the same webhook event twice", async () => {
        const signature = createSignature(payload);

        const response = await request(app)
            .post("/api/webhooks/payment")
            .set("x-webhook-signature", signature)
            .send(payload);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Webhook already processed");
    });

    it("should not process an already successful payment with a different event ID", async () => {
        const duplicatePayload = {
            ...payload,
            eventId: `TEST-EVENT-DIFFERENT-${Date.now()}`,
        };

        const signature = createSignature(duplicatePayload);

        const response = await request(app)
            .post("/api/webhooks/payment")
            .set("x-webhook-signature", signature)
            .send(duplicatePayload);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Payment already completed");
    });
});
