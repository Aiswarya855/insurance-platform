import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createPolicy = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { quoteId } = req.body;

        if (!quoteId) {
            return res.status(400).json({
                success: false,
                message: "Quote ID is required",
            });
        }

        // Find quote
        const quote = await prisma.quote.findUnique({
            where: {
                id: Number(quoteId),
            },
        });

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: "Quote not found",
            });
        }

        // Make sure quote belongs to logged-in user
        if (quote.userId !== req.user!.userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot create policy for this quote",
            });
        }

        // Check whether policy already exists
        const existingPolicy = await prisma.policy.findUnique({
            where: {
                quoteId: Number(quoteId),
            },
        });

        if (existingPolicy) {
            return res.status(409).json({
                success: false,
                message: "Policy already exists for this quote",
            });
        }

        // Generate policy number
        const policyNumber =
            `POL-${Date.now()}`;

        // Policy period: today → 1 year
        const startDate = new Date();

        const endDate = new Date(startDate);
        endDate.setFullYear(
            endDate.getFullYear() + 1
        );

        const policy = await prisma.policy.create({
            data: {
                policyNumber,
                userId: quote.userId,
                productId: quote.productId,
                quoteId: quote.id,
                premium: quote.premium,
                startDate,
                endDate,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Policy created successfully",
            data: policy,
        });
    } catch (error) {
        console.error("CREATE POLICY ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const getMyPolicies = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const policies = await prisma.policy.findMany({
            where: {
                userId: req.user!.userId,
            },
            include: {
                product: true,
                quote: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            data: policies,
        });
    } catch (error) {
        console.error("GET POLICIES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};