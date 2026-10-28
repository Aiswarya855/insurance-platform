
import request from "supertest";
import app from "../app";

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
