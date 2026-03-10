import { Task } from "../models/task.model";
import { redisClient } from "../config/redis";
import { taskQueue } from "../queues/task.queue";
import { mongoQueryDuration } from "../metrics/metrics";

/*
CREATE TASK SERVICE
Responsible for:
1. creating task in MongoDB
2. invalidating cache
3. adding background job
*/

export const createTaskService = async (
  title: string,
  description: string,
  userId: string
) => {

  // invalidate cached task lists for this user
  await redisClient.del(`tasks:${userId}:*`);

  // start DB timing
  const start = Date.now();

  // create the task in MongoDB
  const task = await Task.create({
    title,
    description,
    userId
  });

  // calculate query duration
  const duration = (Date.now() - start) / 1000;

  // record metric
  mongoQueryDuration.labels("create_task").observe(duration);

  console.log("Adding job to queue...");

  // add async background job
  await taskQueue.add("taskCreated", {
    taskId: task._id
  });

  console.log("Job added to queue");

  return task;
};


/*
GET TASKS SERVICE
Responsible for:
1. checking Redis cache
2. querying MongoDB if cache miss
3. caching result
*/

export const getTasksService = async (
  userId: string,
  role: string,
  page: number,
  limit: number,
  status?: string
) => {

  const cacheKey = `tasks:${userId}:${page}:${limit}:${status}`;

  // check Redis cache first
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const query: any = {};

  // RBAC rule
  if (role !== "ADMIN") {
    query.userId = userId;
  }

  if (status) {
    query.status = status;
  }

  // start DB timing
  const start = Date.now();

  const tasks = await Task.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  // calculate DB query duration
  const duration = (Date.now() - start) / 1000;

  // record metric
  mongoQueryDuration.labels("find_tasks").observe(duration);

  // cache result for 60 seconds
  await redisClient.set(cacheKey, JSON.stringify(tasks), {
    EX: 60
  });

  return tasks;
};


/*
UPDATE TASK SERVICE
Responsible for:
1. validating ownership
2. updating MongoDB document
3. invalidating cache
*/

export const updateTaskService = async (
  taskId: string,
  userId: string,
  role: string,
  updates: any
) => {

  // start DB timing
  const start = Date.now();

  const task = await Task.findById(taskId);

  if (!task) throw new Error("Task not found");

  // RBAC ownership check
  if (role !== "ADMIN" && task.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  Object.assign(task, updates);

  const updatedTask = await task.save();

  // calculate DB duration
  const duration = (Date.now() - start) / 1000;

  mongoQueryDuration.labels("update_task").observe(duration);

  // invalidate cache
  await redisClient.del(`tasks:${userId}:*`);

  return updatedTask;
};


/*
DELETE TASK SERVICE
Responsible for:
1. validating ownership
2. deleting MongoDB document
3. invalidating cache
*/

export const deleteTaskService = async (
  taskId: string,
  userId: string,
  role: string
) => {

  const start = Date.now();

  const task = await Task.findById(taskId);

  if (!task) throw new Error("Task not found");

  if (role !== "ADMIN" && task.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await task.deleteOne();

  const duration = (Date.now() - start) / 1000;

  mongoQueryDuration.labels("delete_task").observe(duration);

  await redisClient.del(`tasks:${userId}:*`);

  return { message: "Task deleted" };
};