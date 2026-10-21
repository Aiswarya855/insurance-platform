import { Request, Response } from "express";
import prisma from "../config/prisma";

export const paymentWebhook = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            event,
            eventId,
            transactionId,
            policyId,
            amount,
            status,
        } = req.body;

        // 1. Validate webhook payload
        if (
            !event ||
            !eventId ||
            !transactionId ||
            !policyId ||
            amount === undefined ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid webhook payload",
            });
        }

        // 2. Validate event type
        if (event !== "payment.success") {
            return res.status(400).json({
                success: false,
                message: "Unsupported webhook event",
            });
        }

        // 3. Find payment using transaction ID
        const payment = await prisma.payment.findUnique({
            where: {
                transactionId,
            },
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        // 4. Prevent duplicate webhook processing
        if (payment.eventId === eventId) {
            return res.status(200).json({
                success: true,
                message: "Webhook already processed",
            });
        }

        // 5. Verify policy matches payment
        if (payment.policyId !== Number(policyId)) {
            return res.status(400).json({
                success: false,
                message: "Policy does not match payment",
            });
        }

        // 6. Verify payment amount
        if (Number(payment.amount) !== Number(amount)) {
            return res.status(400).json({
                success: false,
                message: "Payment amount mismatch",
            });
        }

        // 7. Update payment and policy inside one transaction
        const updatedPayment = await prisma.$transaction(
            async (tx) => {
                const updatedPayment = await tx.payment.update({
                    where: {
                        id: payment.id,
                    },
                    data: {
                        status: "SUCCESS",
                        eventId,
                    },
                });

                await tx.policy.update({
                    where: {
                        id: payment.policyId,
                    },
                    data: {
                        status: "ACTIVE",
                    },
                });

                return updatedPayment;
            }
        );

        // 8. Return success response
        return res.status(200).json({
            success: true,
            message: "Payment webhook processed successfully",
            data: {
                paymentId: updatedPayment.id,
                transactionId: updatedPayment.transactionId,
                status: updatedPayment.status,
            },
        });
    } catch (error) {
        console.error("PAYMENT WEBHOOK ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};