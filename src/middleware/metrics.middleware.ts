import { Request, Response, NextFunction } from "express";
import { httpRequestCounter } from "../metrics/metrics";

// middleware runs on every request
export const metricsMiddleware = (

  req: Request,
  res: Response,
  next: NextFunction

) => {

  // increment counter for every request
  httpRequestCounter.inc();

  // pass control to next middleware / route
  next();
};