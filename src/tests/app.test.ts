
import request from "supertest";
import app from "../app";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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


describe("Payment webhook signature", () => {
    const payload = {
        eventId: "test-event-001",
        paymentId: 999999,
        status: "SUCCESS",
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

    it("should accept a webhook with a valid signature", async () => {
        const secret = process.env.WEBHOOK_SECRET;

        if (!secret) {
            throw new Error("WEBHOOK_SECRET is not configured for tests");
        }

        const signature = crypto
            .createHmac("sha256", secret)
            .update(JSON.stringify(payload))
            .digest("hex");

        const response = await request(app)
            .post("/api/webhooks/payment")
            .set("x-webhook-signature", signature)
            .send(payload);

        // Signature verification should pass.
        // The controller may return another status if the payment doesn't exist.
        expect(response.status).not.toBe(401);
    });
});

