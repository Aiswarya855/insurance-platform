import { Router } from "express";

import {
    createPayment,
    getMyPayments,
} from "../controllers/payment.controller";

import {
    authenticate,
} from "../middlewares/auth.middleware";

const router = Router();

router.post(
    "/",
    authenticate,
    createPayment
);

router.get(
    "/my",
    authenticate,
    getMyPayments
);

export default router;