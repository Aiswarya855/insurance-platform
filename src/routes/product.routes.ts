import { Router } from "express";

import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller";

import {
    authenticate,
    authorize,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createProduct
);

router.put(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    updateProduct
);

router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    deleteProduct
);

export default router;