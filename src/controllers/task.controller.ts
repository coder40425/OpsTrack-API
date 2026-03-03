import { Request, Response } from "express";
import {
  createTaskService,
  getTasksService,
  updateTaskService,
  deleteTaskService
} from "../services/task.service";

export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description } = req.body;
    const result = await createTaskService(
      title,
      description,
      req.user.id
    );
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTasks = async (req: any, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await getTasksService(
      req.user.id,
      req.user.role,
      Number(page),
      Number(limit),
      status
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTask = async (req: any, res: Response) => {
  try {
    const result = await updateTaskService(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.json(result);
  } catch (error: any) {
    res.status(403).json({ message: error.message });
  }
};

export const deleteTask = async (req: any, res: Response) => {
  try {
    const result = await deleteTaskService(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json(result);
  } catch (error: any) {
    res.status(403).json({ message: error.message });
  }
};