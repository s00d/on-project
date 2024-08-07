import { Request, Response } from 'express'
import { Label, Task, User, Comment } from '../models'
import { io } from '../index'
import { Op } from 'sequelize'
import { logTaskHistory } from './taskHistoryController'
import { createNotification } from './notificationController'

const getTasks = async (req: Request, res: Response) => {
  const { projectId } = req.params
  const { status, priority, search } = req.query
  const whereClause: any = { projectId }

  if (status) whereClause.status = status
  if (priority) whereClause.priority = priority
  if (search) whereClause.title = { [Op.like]: `%${search}%` }

  try {
    const tasks = await Task.findAll({ where: whereClause, include: [User, Label] })
    res.json(tasks)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const getTask = async (req: Request, res: Response) => {
  const { projectId, id } = req.params

  try {
    const task = await Task.findOne({ where: { projectId, id }, include: [User, Label] })
    res.json(task)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const createTask = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, description, status, assigneeId, labelId, dueDate, priority, estimatedTime, type, plannedDate, relatedTaskId, actualTime, tags } = req.body;
  const userId = req.session.user!.id;

  try {
    const task = await Task.create({
      title,
      description,
      status,
      projectId: Number(projectId),
      assigneeId,
      labelId,
      dueDate,
      priority,
      estimatedTime,
      type,
      plannedDate,
      relatedTaskId,
      actualTime,
      tags: tags ?? []
    });
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
  const { projectId, id } = req.params;
  const { title, description, status, assigneeId, labelId, dueDate, priority, estimatedTime, type, plannedDate, relatedTaskId, actualTime, tags } = req.body;
  const userId = req.session.user!.id;

  try {
    const task = await Task.findOne({ where: { id, projectId } });
    if (task) {
      const updatedFields: Partial<Task> = {};

      if (title !== undefined) updatedFields.title = title;
      if (description !== undefined) updatedFields.description = description;
      if (status !== undefined) updatedFields.status = status;
      if (assigneeId !== undefined) updatedFields.assigneeId = assigneeId;
      if (labelId !== undefined) updatedFields.labelId = labelId;
      if (dueDate !== undefined) updatedFields.dueDate = dueDate;
      if (priority !== undefined) updatedFields.priority = priority;
      if (estimatedTime !== undefined) updatedFields.estimatedTime = estimatedTime;
      if (type !== undefined) updatedFields.type = type;
      if (plannedDate !== undefined) updatedFields.plannedDate = plannedDate;
      if (relatedTaskId !== undefined) updatedFields.relatedTaskId = relatedTaskId;
      if (actualTime !== undefined) updatedFields.actualTime = actualTime;
      if (tags !== undefined) updatedFields.tags = tags;

      await task.update(updatedFields);
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
  const { projectId, id } = req.params
  const userId = req.session.user!.id

  try {
    const task = await Task.findOne({ where: { id, projectId } })
    if (task) {
      await task.destroy()
      await logTaskHistory(task.id, userId, 'deleted')
      io.emit('task:delete', { id: Number(id) })
      res.status(204).end()
    } else {
      res.status(404).json({ error: 'Task not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

export { getTasks, getTask, createTask, updateTask, deleteTask }
