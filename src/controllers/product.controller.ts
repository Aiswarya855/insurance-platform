import { Request, Response } from "express";
import prisma from "../config/prisma";

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, category, description, basePrice } = req.body;

        if (!name || !category || basePrice === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, category and basePrice are required",
            });
        }

        const product = await prisma.product.create({
            data: {
                name,
                category,
                description,
                basePrice,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("GET PRODUCT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { name, category, description, basePrice, status } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                category,
                description,
                basePrice,
                status,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        await prisma.product.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};