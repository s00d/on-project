import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { TaskHistory } from '../models/TaskHistory';
import {Task} from "../models/Task";
import {In} from "typeorm";
const getTaskHistory = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  try {
    const taskHistoryRepository = AppDataSource.getRepository(TaskHistory);
    const history = await taskHistoryRepository.find({
      where: { task: { id: parseInt(taskId) } },
      relations: ['task', 'user'],
    });
    res.json(history);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const clearTaskHistoryByTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  try {
    const taskHistoryRepository = AppDataSource.getRepository(TaskHistory);
    await taskHistoryRepository.delete({ task: { id: parseInt(taskId) } });
    res.status(204).end();
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const clearTaskHistoryByProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const taskHistoryRepository = AppDataSource.getRepository(TaskHistory);
    const tasks = await AppDataSource.getRepository(Task).find({ where: { project: { id: parseInt(projectId) } } });

    if (tasks.length > 0) {
      const taskIds = tasks.map(task => task.id);
      await taskHistoryRepository.delete({ task: { id: In(taskIds) } });
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Project or tasks not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const logTaskHistory = async (taskId: number, userId: number, action: string) => {
  try {
    const taskHistoryRepository = AppDataSource.getRepository(TaskHistory);
    const newTaskHistory = taskHistoryRepository.create({
      task: { id: taskId },
      user: { id: userId },
      action,
    });
    return await taskHistoryRepository.save(newTaskHistory);
  } catch (err) {
    console.error('Failed to log task history', err);
  }
};

export { getTaskHistory, logTaskHistory, clearTaskHistoryByTask, clearTaskHistoryByProject };
