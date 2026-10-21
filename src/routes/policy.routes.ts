import { Router } from "express";

import {
    createPolicy,
    getMyPolicies,
} from "../controllers/policy.controller";

import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post(
    "/",
    authenticate,
    createPolicy
);

router.get(
    "/my",
    authenticate,
    getMyPolicies
);

export default router;