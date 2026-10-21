
import { Router } from "express";

import {
    getAllUsers,
    getAllQuotes,
    getAllPolicies,
    getAllPayments,
    getAdminDashboard,
} from "../controllers/admin.controller";

import {
    authenticate,
    authorize,
} from "../middlewares/auth.middleware";

const router = Router();

router.get(
    "/dashboard",
    authenticate,
    authorize("ADMIN"),
    getAdminDashboard
);

router.get(
    "/users",
    authenticate,
    authorize("ADMIN"),
    getAllUsers
);

router.get(
    "/quotes",
    authenticate,
    authorize("ADMIN"),
    getAllQuotes
);

router.get(
    "/policies",
    authenticate,
    authorize("ADMIN"),
    getAllPolicies
);

router.get(
    "/payments",
    authenticate,
    authorize("ADMIN"),
    getAllPayments
);

export default router;
