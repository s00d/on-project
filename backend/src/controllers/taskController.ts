import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Task } from '../models/Task';
import { logTaskHistory } from './taskHistoryController';
import { createNotification } from './notificationController';
import {In, Like} from 'typeorm';
import { io } from '../index';
import { Label } from "../models/Label";
import { Project } from "../models/Project";
import { User } from "../models/User";
import {ProjectUser} from "../models/ProjectUser";

const getTasks = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { status, priority, search, assignee, tags, pageSize = 10, page = 1 } = req.query;

  const whereClause: any = { project: { id: parseInt(projectId) } };

  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;
  if (search) {
    whereClause.title = Like(`%${search}%`);
    whereClause.description = Like(`%${search}%`);
  }

  if (assignee) {
    const assigneeIds = (assignee as string).split(',');
    whereClause.assignees = { id: Like(`%${assigneeIds}%`) };
  }

  if (tags) {
    whereClause.tags = (tags as string).split(',').map(tag => Like(`%${tag}%`));
  }

  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const [tasks, count] = await taskRepository.findAndCount({
      where: whereClause,
      relations: ['label', 'assignees'],
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    const tasksWithAssigneeIds = tasks.map(task => ({
      ...task,
      assignees: task.assignees.map(assignee => assignee.id),
    }));

    res.json({ tasks: tasksWithAssigneeIds, total: count });
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message, stack: error.stack });
  }
};

const getTask = async (req: Request, res: Response) => {
  const { projectId, id } = req.params;

  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const task = await taskRepository.findOne({
      where: { project: { id: parseInt(projectId) }, id: parseInt(id) },
      relations: ['label', 'assignees'],
    });
    const taskWithAssigneeIds = {
      ...task,
      assignees: task?.assignees.map(assignee => assignee.id),
    };

    res.json(taskWithAssigneeIds);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const createTask = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, description, status, assignees: assigneeIds, labelId, dueDate, priority, estimatedTime, type, plannedDate, relatedTaskId, actualTime, tags, customFields } = req.body;
  const userId = req.session.user!.id;

  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const labelRepository = AppDataSource.getRepository(Label);
    const projectRepository = AppDataSource.getRepository(Project);
    const projectUserRepository = AppDataSource.getRepository(ProjectUser);

    const project = await projectRepository.findOne({ where: { id: parseInt(projectId) } });
    const label = labelId ? await labelRepository.findOne({ where: { id: labelId } }) : null;
    const relatedTask = relatedTaskId ? await taskRepository.findOne({ where: { id: relatedTaskId } }) : null;
    const assignees = assigneeIds ? await projectUserRepository.find({
      where: {
        user: { id: In(assigneeIds) },
        project: { id: parseInt(projectId) }
      },
      relations: ['user']
    }) : [];

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const newTask: Partial<Task> = {
      title,
      description,
      status,
      project,
      assignees,
      dueDate,
      priority,
      estimatedTime,
      type,
      plannedDate,
      actualTime,
      tags: tags ?? [],
      customFields: customFields ?? {}
    }

    if (label) {
      newTask.label = label;
    }

    if (relatedTask) {
      newTask.relatedTask = relatedTask;
    }

    const task = taskRepository.create(newTask);
    await taskRepository.save(task);
    await logTaskHistory(task.id, userId, 'created');
    if (assignees && assignees.length) {
      for (let assignee of assignees) {
        await createNotification(assignee.id, `You have been assigned a new task: ${title}`);
      }
    }
    const taskWithAssigneeIds = {
      ...task,
      assignees: task?.assignees.map(assignee => assignee.id),
    };

    io.emit('task:create', task);
    res.json(taskWithAssigneeIds);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const updateTask = async (req: Request, res: Response) => {
  const { projectId, id } = req.params;
  const { title, description, status, assignees: assigneeIds, labelId, dueDate, priority, estimatedTime, type, plannedDate, relatedTaskId, actualTime, tags, customFields } = req.body;
  const userId = req.session.user!.id;

  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const labelRepository = AppDataSource.getRepository(Label);
    const projectUserRepository = AppDataSource.getRepository(ProjectUser);

    const task = await taskRepository.findOne({ where: { id: parseInt(id), project: { id: parseInt(projectId) } }, relations: ['project', 'label', 'relatedTask', 'assignees'] });
    const label = labelId ? await labelRepository.findOne({ where: { id: labelId } }) : null;
    const relatedTask = relatedTaskId ? await taskRepository.findOne({ where: { id: relatedTaskId } }) : null;
    const assignees = assigneeIds ? await projectUserRepository.find({
      where: {
        user: { id: In(assigneeIds) },
        project: { id: parseInt(projectId) }
      },
      relations: ['user']
    }) : [];

    if (task) {
      const updatedFields: Partial<Task> = {};

      if (title !== undefined) updatedFields.title = title;
      if (description !== undefined) updatedFields.description = description;
      if (status !== undefined) updatedFields.status = status;
      if (assignees !== undefined) updatedFields.assignees = assignees;
      if (label) updatedFields.label = label;
      if (dueDate !== undefined) updatedFields.dueDate = dueDate;
      if (priority !== undefined) updatedFields.priority = priority;
      if (estimatedTime !== undefined) updatedFields.estimatedTime = estimatedTime;
      if (type !== undefined) updatedFields.type = type;
      if (plannedDate !== undefined) updatedFields.plannedDate = plannedDate;
      if (relatedTask) updatedFields.relatedTask = relatedTask;
      if (actualTime !== undefined) updatedFields.actualTime = actualTime;
      if (tags !== undefined) updatedFields.tags = tags;
      if (customFields !== undefined) updatedFields.customFields = customFields;

      await taskRepository.save({ ...task, ...updatedFields });
      await logTaskHistory(task.id, userId, 'updated');

      if (assignees && assignees.length) {
        for (let assignee of assignees) {
          await createNotification(assignee.id, `Task updated: ${title}`);
        }
      }

      const taskWithAssigneeIds = {
        ...task,
        assignees: task?.assignees.map(assignee => assignee.id),
      };

      io.emit('task:update', taskWithAssigneeIds);
      res.json(taskWithAssigneeIds);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const deleteTask = async (req: Request, res: Response) => {
  const { projectId, id } = req.params;
  const userId = req.session.user!.id;

  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const task = await taskRepository.findOne({ where: { id: parseInt(id), project: { id: parseInt(projectId) } } });
    if (task) {
      await taskRepository.remove(task);
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

export { getTasks, getTask, createTask, updateTask, deleteTask };
