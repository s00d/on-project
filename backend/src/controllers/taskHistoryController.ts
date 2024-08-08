import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { TaskHistory } from '../models/TaskHistory';

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

export { getTaskHistory, logTaskHistory };
