import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const createPayment = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { policyId } = req.body;

        if (!policyId) {
            return res.status(400).json({
                success: false,
                message: "Policy ID is required",
            });
        }

        const policy = await prisma.policy.findUnique({
            where: {
                id: Number(policyId),
            },
        });

        if (!policy) {
            return res.status(404).json({
                success: false,
                message: "Policy not found",
            });
        }

        // Make sure the logged-in user owns the policy
        if (policy.userId !== req.user!.userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot make payment for this policy",
            });
        }

        // Check existing payment for this policy
        const existingPayment = await prisma.payment.findFirst({
            where: {
                policyId: policy.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Payment already completed
        if (existingPayment?.status === "SUCCESS") {
            return res.status(409).json({
                success: false,
                message: "Payment already completed for this policy",
            });
        }

        // Payment already pending
        if (existingPayment?.status === "PENDING") {
            return res.status(409).json({
                success: false,
                message: "Payment is already pending for this policy",
                data: {
                    paymentId: existingPayment.id,
                    transactionId: existingPayment.transactionId,
                },
            });
        }

        const transactionId = `TXN-${Date.now()}`;

        const payment = await prisma.payment.create({
            data: {
                policyId: policy.id,
                transactionId,
                amount: policy.premium,
                status: "PENDING",
            },
        });

        return res.status(201).json({
            success: true,
            message: "Payment initiated successfully",
            data: payment,
        });
    } catch (error) {
        console.error("CREATE PAYMENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const getMyPayments = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const payments = await prisma.payment.findMany({
            where: {
                policy: {
                    userId: req.user!.userId,
                },
            },
            include: {
                policy: {
                    include: {
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
            data: payments,
        });
    } catch (error) {
        console.error("GET PAYMENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};