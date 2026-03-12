import { Router } from "express";
import { register } from "../metrics/metrics";

const router = Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     description: Returns application metrics for Prometheus scraping
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Metrics returned
 */
router.get("/", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export default router;