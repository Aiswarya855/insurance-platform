import { Router } from "express";

import {
    paymentWebhook,
} from "../controllers/webhook.controller";

import {
    verifyWebhookSignature,
} from "../middlewares/webhook.middleware";

const router = Router();

router.post(
    "/payment",
    verifyWebhookSignature,
    paymentWebhook
);

export default router;