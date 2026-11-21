/**
 * Health Router
 *
 * Basic health check endpoint.
 */

import { z } from "zod";
import { pub } from "../procedures";
import { getQueryStats, getSlowQueries } from "../lib/db-performance";

export const healthRouter = {
  check: pub
    .route({
      method: "GET",
      path: "/health",
      summary: "Health check",
      tags: ["System"],
    })
    .output(
      z.object({
        status: z.enum(["ok", "error"]),
        timestamp: z.string(),
        version: z.string(),
      }),
    )
    .handler(async () => {
      return {
        status: "ok" as const,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };
    }),

  dbStats: pub
    .route({
      method: "GET",
      path: "/health/db-stats",
      summary: "In-process query performance stats",
      tags: ["System"],
    })
    .output(z.any())
    .handler(async () => {
      return {
        stats: getQueryStats(),
        slowQueries: getSlowQueries().slice(-20),
      };
    }),
};
