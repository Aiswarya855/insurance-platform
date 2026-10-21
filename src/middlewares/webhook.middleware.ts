import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const verifyWebhookSignature = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const signature = req.headers["x-webhook-signature"];

        if (!signature || typeof signature !== "string") {
            return res.status(401).json({
                success: false,
                message: "Webhook signature missing",
            });
        }

        const secret = process.env.WEBHOOK_SECRET;

        if (!secret) {
            return res.status(500).json({
                success: false,
                message: "Webhook secret not configured",
            });
        }

        const payload = JSON.stringify(req.body);

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex");

        const isValid = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid webhook signature",
            });
        }

        next();
    } catch (error) {
        console.error("WEBHOOK SIGNATURE ERROR:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid webhook signature",
        });
    }
};