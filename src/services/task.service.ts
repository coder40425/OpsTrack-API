import { Task } from "../models/task.model";
import { redisClient } from "../config/redis";
import { taskQueue } from "../queues/task.queue";

export const createTaskService = async (
  title: string,
  description: string,
  userId: string
) => {

  await redisClient.del(`tasks:${userId}:*`); //invalidate cache for this user
 
  // create the task first so we have its id
  const task = await Task.create({
    title,
    description,
    userId
  });

  console.log("Adding job to queue...");

  await taskQueue.add("taskCreated", {
  taskId: task._id
  });

  console.log("Job added to queue");

  return task;
};

export const getTasksService = async (
  userId: string,
  role: string,
  page: number,
  limit: number,
  status?: string
) => {

  const cacheKey = `tasks:${userId}:${page}:${limit}:${status}`;
  const cached = await redisClient.get(cacheKey);
  if(cached){
    return JSON.parse(cached);
  }

  const query: any = {};

  if (role !== "ADMIN") {
    query.userId = userId;
  }

  if (status) {
    query.status = status;
  }

  const tasks = await Task.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Cache the result
  await redisClient.set(cacheKey, JSON.stringify(tasks), {
    EX: 60 //cache for 60 seconds
  });

  return tasks;

};

export const updateTaskService = async (
  taskId: string,
  userId: string,
  role: string,
  updates: any
) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  if (role !== "ADMIN" && task.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  Object.assign(task, updates);

  await redisClient.del(`tasks:${userId}:*`); //invalidate cache for this user

  return await task.save();
};

export const deleteTaskService = async (
  taskId: string,
  userId: string,
  role: string
) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  if (role !== "ADMIN" && task.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await task.deleteOne();

  await redisClient.del(`tasks:${userId}:*`); //invalidate cache for this user
  
  return { message: "Task deleted" };
};