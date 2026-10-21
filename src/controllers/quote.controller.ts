import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { getInsurancePremium } from "../services/insurance-api.service";

export const createQuote = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const {
            productId,
            vehicleNumber,
            vehicleType,
            coverageAmount,
        } = req.body;

        if (!productId || !coverageAmount) {
            return res.status(400).json({
                success: false,
                message: "Product and coverage amount are required",
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: Number(productId),
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // const premium =
        //     Number(coverageAmount) * 0.02;
        const insuranceResult = await getInsurancePremium(
            vehicleType,
            Number(coverageAmount)
        );

        const premium = insuranceResult.premium;

        const quote = await prisma.quote.create({
            data: {
                userId: req.user!.userId,
                productId: Number(productId),
                vehicleNumber,
                vehicleType,
                coverageAmount,
                premium,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Quote generated successfully",
            data: quote,
        });
    } catch (error) {
        console.error("CREATE QUOTE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const getMyQuotes = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const quotes = await prisma.quote.findMany({
            where: {
                userId: req.user!.userId,
            },
            include: {
                product: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data: quotes,
        });
    } catch (error) {
        console.error("GET QUOTES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};