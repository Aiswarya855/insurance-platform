
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: number;
    role: string;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export const authenticate = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required",
            });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }

        const decoded = jwt.verify(token, secret, {
            algorithms: ["HS256"],
        });

        if (
            typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.userId !== "number" ||
            !Number.isInteger(decoded.userId) ||
            decoded.userId <= 0 ||
            typeof decoded.role !== "string" ||
            decoded.role.trim() === ""
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export const authorize = (...allowedRoles: string[]) => {
    return (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        next();
    };
};
