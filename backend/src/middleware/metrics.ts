import { Request, Response, NextFunction } from "express";
import pool from "../config/database";

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();

    res.on("finish", async () => {
        const end = process.hrtime.bigint();
        const durationMs = Number((end - start) / 1_000_000n);

        const route = req.route?.path
        ? `${req.baseUrl}${req.route.path}`
        : req.originalUrl.split("?")[0];

        try {
        await pool.query(
            `INSERT INTO http_metrics (method, route, status_code, duration_ms)
            VALUES ($1, $2, $3, $4)`,
            [req.method, route, res.statusCode, durationMs]
        );
        } catch (err) {
        console.error("metrics insert failed", err);
        }
    });

    next();
}
