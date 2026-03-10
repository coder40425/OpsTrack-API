import IORedis from "ioredis";

// BullMQ requires ioredis connection
export const redisQueueConnection = new IORedis(process.env.REDIS_URL!);