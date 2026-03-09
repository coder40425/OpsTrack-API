import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs: 15*60*1000, //15 mins
    max: 100, //limit each api key to 100 requests per windows
    message: "Too many requests from this API key, please try again after 15 minutes"
});