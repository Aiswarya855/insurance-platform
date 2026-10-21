import { Router } from "express";

import {
    registerUser,
    loginUser,
    getMe,
    adminTest,
} from "../controllers/user.controller";

import { 
    authenticate ,
    authorize,
} from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", authenticate, getMe);
router.get(
    "/admin-test",
    authenticate,
    authorize("ADMIN"),
    adminTest
);

export default router;