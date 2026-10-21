import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
    registerUserService,
    loginUserService,
} from "../services/user.service";

export const registerUser = async (
    req: Request,
    res: Response
) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        const user = await registerUserService(
            name,
            email,
            password
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (error: any) {
        console.error("REGISTER ERROR:", error);

        if (error.message === "EMAIL_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
};

export const loginUser = async (
    req: Request,
    res: Response
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const result = await loginUserService(
            email,
            password
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error: any) {
        console.error("LOGIN ERROR:", error);

        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
};

export const getMe = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user!.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("GET ME ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

export const adminTest = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    return res.status(200).json({
        success: true,
        message: "Admin access granted",
        user: req.user,
    });
};