import { Request, Response } from 'express'
import { Label, Task, User, Comment } from '../models'
import { io } from '../index'
import { Op } from 'sequelize'
import { logTaskHistory } from './taskHistoryController'
import { createNotification } from './notificationController'

const getTasks = async (req: Request, res: Response) => {
  const { projectId } = req.params
  const { status, priority, search, assignee, tags, pageSize = 10, page = 1 } = req.query

  const whereClause: any = { projectId }

  if (status) whereClause.status = status
  if (priority) whereClause.priority = priority
  if (search) whereClause.title = { [Op.like]: `%${search}%` }
  if (search) whereClause.description = { [Op.like]: `%${search}%` }
  if (search) whereClause.assigneeIds = { [Op.like]: `%${search}%` }
  if (search) whereClause.status = { [Op.like]: `%${search}%` }



  if (assignee) {
    const assigneeIds = (assignee as string).split(',');
    assigneeIds.forEach((assigneeId: string) => {
      whereClause.assigneeIds = {
        [Op.or]: [
          { [Op.like]: `${assigneeId},%` }, // Начало строки
          { [Op.like]: `%,${assigneeId},%` }, // В середине строки
          { [Op.like]: `%,${assigneeId}` }, // Конец строки
          { [Op.like]: `${assigneeId}` } // Точное совпадение
        ]
      };
    })

  }


  if (tags) {
    whereClause.tags = {
      [Op.or]: [
        { [Op.like]: `${tags},%` }, // Начало строки
        { [Op.like]: `%,${tags},%` }, // В середине строки
        { [Op.like]: `%,${tags}` }, // Конец строки
        { [Op.like]: `${tags}` } // Точное совпадение
      ]
    };
  }

  try {
    const { count, rows } = await Task.findAndCountAll({
      where: whereClause,
      include: [Label],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    })
    res.json({ tasks: rows, total: count })
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const getTask = async (req: Request, res: Response) => {
  const { projectId, id } = req.params

  try {
    const task = await Task.findOne({ where: { projectId, id }, include: [Label] })
    res.json(task)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const createTask = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, description, status, assigneeIds, labelId, dueDate, priority, estimatedTime, type, plannedDate, relatedTaskId, actualTime, tags, customFields } = req.body;
  const userId = req.session.user!.id;

  try {
    const task = await Task.create({
      title,
      description,
      status,
      projectId: Number(projectId),
      assigneeIds: assigneeIds ?? [],
      labelId,
      dueDate,
      priority,
      estimatedTime,
      type,
      plannedDate,
      relatedTaskId,
      actualTime,
      tags: tags ?? [],
      customFields: customFields ?? {}
    });
    await logTaskHistory(task.id, userId, 'created');
    if (assigneeIds && assigneeIds.length) {
      for (let i in assigneeIds) {
        await createNotification(assigneeIds[i], `You have been assigned a new task: ${title}`);
      }
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
  const { title, description, status, assigneeIds, labelId, dueDate, priority, estimatedTime, type, plannedDate, relatedTaskId, actualTime, tags, customFields } = req.body;
  const userId = req.session.user!.id;

  try {
    const task = await Task.findOne({ where: { id, projectId } });
    if (task) {
      const updatedFields: Partial<Task> = {};

      if (title !== undefined) updatedFields.title = title;
      if (description !== undefined) updatedFields.description = description;
      if (status !== undefined) updatedFields.status = status;
      if (assigneeIds !== undefined) updatedFields.assigneeIds = assigneeIds;
      if (labelId !== undefined) updatedFields.labelId = labelId;
      if (dueDate !== undefined) updatedFields.dueDate = dueDate;
      if (priority !== undefined) updatedFields.priority = priority;
      if (estimatedTime !== undefined) updatedFields.estimatedTime = estimatedTime;
      if (type !== undefined) updatedFields.type = type;
      if (plannedDate !== undefined) updatedFields.plannedDate = plannedDate;
      if (relatedTaskId !== undefined) updatedFields.relatedTaskId = relatedTaskId;
      if (actualTime !== undefined) updatedFields.actualTime = actualTime;
      if (tags !== undefined) updatedFields.tags = tags;
      if (customFields !== undefined) updatedFields.customFields = customFields;

      await task.update(updatedFields);
      await logTaskHistory(task.id, userId, 'updated');

      if (assigneeIds && assigneeIds.length) {
        for (let i in assigneeIds) {
          await createNotification(assigneeIds[i], `Task updated: ${title}`);
        }
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
