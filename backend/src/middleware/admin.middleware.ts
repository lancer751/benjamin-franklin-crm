// Admin middleware
// Simulated admin guard — in production replace with real JWT/session check.

import type { Request, Response, NextFunction } from "express";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin-secret-key";

/**
 * Simple admin check: expects the header `x-admin-secret` to match
 * the ADMIN_SECRET environment variable.
 *
 * Replace with real auth (JWT, session, etc.) when ready.
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
    const adminHeader = req.headers["x-admin-secret"];

    if (!adminHeader || adminHeader !== ADMIN_SECRET) {
        res.status(403).json({ error: "Forbidden: admin access required" });
        return;
    }

    next();
}
