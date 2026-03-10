import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import { Worker } from "bullmq";

// Worker listens to queue named "taskQueue"
new Worker(
  "taskQueue",

  // Job processor function
  async job => {
    console.log("Processing job:", job.data);
  },

  {
    // BullMQ will internally create Redis connection
    connection: {
      url: process.env.REDIS_URL
    }
  }
);