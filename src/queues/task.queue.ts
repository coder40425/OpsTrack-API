import { Queue } from "bullmq";
import { redisQueueConnection } from "../config/redisQueue";

// create queue called taskQueue
export const taskQueue = new Queue(

  "taskQueue",

  {
    // queue uses redis for storage
    connection: {
      url: process.env.REDIS_URL
    }
  }
);