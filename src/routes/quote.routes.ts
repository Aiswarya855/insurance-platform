import { Router } from "express";

import {
    createQuote,
    getMyQuotes,
} from "../controllers/quote.controller";

import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post(
    "/",
    authenticate,
    createQuote
);

router.get(
    "/my",
    authenticate,
    getMyQuotes
);

export default router;