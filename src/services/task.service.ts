import { Task } from "../models/task.model";

export const createTaskService = async (
  title: string,
  description: string,
  userId: string
) => {
  return await Task.create({
    title,
    description,
    userId
  });
};

export const getTasksService = async (
  userId: string,
  role: string,
  page: number,
  limit: number,
  status?: string
) => {
  const query: any = {};

  if (role !== "ADMIN") {
    query.userId = userId;
  }

  if (status) {
    query.status = status;
  }

  return await Task.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
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
  return { message: "Task deleted" };
};