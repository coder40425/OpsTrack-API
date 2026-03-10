import { Request, Response, NextFunction } from "express";
import { httpRequestCounter, httpRequestDuration } from "../metrics/metrics";

// middleware runs on every request
export const metricsMiddleware = (

  req: Request,
  res: Response,
  next: NextFunction

) => {

  //start timer
  const start = Date.now();

  //when response finishes
  res.on("finish", () => {

    const duration = (Date.now() - start) / 1000; // duration in seconds

    // increment counter for every request
    httpRequestCounter.inc();

    //record latency
    httpRequestDuration
    .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
    .observe(duration);

  });

  // pass control to next middleware / route
  next();
};