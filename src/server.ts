import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import taskRoutes from "./routes/task.routes";
import { connectRedis } from './config/redis';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { httpLogger } from './middleware/logger.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { register } from './metrics/metrics';
import { setupSwagger } from "./config/swagger";
import metricsRoutes from "./routes/metrics.routes";


connectDB();
connectRedis();

const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app); // setup Swagger documentation

app.use(httpLogger); //middleware logs request details
app.use(metricsMiddleware); //middleware collects metrics for every request
app.use("/api", apiLimiter); //apply rate limiter to all /api routes


app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/test", (req,res)=>{
  res.send("working")
})

app.get("/api/profile", authMiddleware, (req: any, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});
app.get("/", (req, res) => {
    res.send("API is running...!")
})


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
// Prometheus will call this endpoint
app.get("/metrics", async (req, res) => {

  // content type required by Prometheus
  res.set("Content-Type", register.contentType);

  // return metrics data
  res.end(await register.metrics());
});

app.use("/metrics", metricsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
