
import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const getAllUsers = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
        });
    } catch (error) {
        console.error("GET ALL USERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};


export const getAllQuotes = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const quotes = await prisma.quote.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                product: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Quotes fetched successfully",
            data: quotes,
        });
    } catch (error) {
        console.error("GET ALL QUOTES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};


export const getAllPolicies = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const policies = await prisma.policy.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                product: true,
                quote: true,
                payments: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Policies fetched successfully",
            data: policies,
        });
    } catch (error) {
        console.error("GET ALL POLICIES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};


export const getAllPayments = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                policy: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        product: true,
                        quote: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Payments fetched successfully",
            data: payments,
        });
    } catch (error) {
        console.error("GET ALL PAYMENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};



export const getAdminDashboard = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const [
            totalUsers,
            totalProducts,
            totalQuotes,
            totalPolicies,
            successfulPayments,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.product.count(),
            prisma.quote.count(),
            prisma.policy.count(),
            prisma.payment.findMany({
                where: { status: "SUCCESS" },
                select: { amount: true },
            }),
        ]);

        const totalPaymentAmount = successfulPayments.reduce(
            (total, payment) => total + payment.amount,
            0
        );

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: {
                totalUsers,
                totalProducts,
                totalQuotes,
                totalPolicies,
                successfulPayments: successfulPayments.length,
                totalPaymentAmount,
            },
        });
    } catch (error) {
        console.error("GET ADMIN DASHBOARD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
