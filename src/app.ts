import express from "express";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import quoteRoutes from "./routes/quote.routes";
import policyRoutes from "./routes/policy.routes";
import paymentRoutes from "./routes/payment.routes";
import webhookRoutes from "./routes/webhook.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Insurance Platform API is running",
    });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/admin", adminRoutes);

export default app;