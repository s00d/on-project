import { Request, Response } from 'express';
import { Task } from '../models';
import { io } from '../index';
import { Op } from 'sequelize';
import { logTaskHistory } from './taskHistoryController';
import { createNotification } from './notificationController';


const getTasks = async (req: Request, res: Response) => {
  const { status, priority, search } = req.query;
  const whereClause: any = {};

  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;
  if (search) whereClause.title = { [Op.like]: `%${search}%` };

  const tasks = await Task.findAll({ where: whereClause });
  res.json(tasks);
};

const createTask = async (req: Request, res: Response) => {
  const { title, description, status, projectId, assigneeId, labelId, dueDate, priority } = req.body;
  const userId = req.session.user!.id;
  try {
    const task = await Task.create({ title, description, status, projectId, assigneeId, labelId, dueDate, priority });
    await logTaskHistory(task.id, userId, 'created');
    if (assigneeId) {
      await createNotification(assigneeId, `You have been assigned a new task: ${title}`);
    }
    io.emit('task:create', task);
    res.json(task);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, assigneeId, labelId, dueDate, priority } = req.body;
  const userId = req.session.user!.id;
  try {
    const task = await Task.findByPk(id);
    if (task) {
      await task.update({ title, description, status, assigneeId, labelId, dueDate, priority });
      await logTaskHistory(task.id, userId, 'updated');
      if (assigneeId) {
        await createNotification(assigneeId, `Task updated: ${title}`);
      }
      io.emit('task:update', task);
      res.json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.session.user!.id;
  try {
    const task = await Task.findByPk(id);
    if (task) {
      await task.destroy();
      await logTaskHistory(task.id, userId, 'deleted');
      io.emit('task:delete', { id: Number(id) });
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { getTasks, createTask, updateTask, deleteTask };
