import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Task } from '../models/Task';
import { logTaskHistory } from './taskHistoryController';
import { createNotification } from './notificationController';
import {Brackets, In, Like} from 'typeorm';
import { io } from '../index';
import { Label } from "../models/Label";
import { Project } from "../models/Project";
import {ProjectUser} from "../models/ProjectUser";
import {Sprint} from "../models/Sprint";

const getTasks = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { status, priority, search, assignee, tags, sprintId, pageSize = 10, page = 1 } = req.query;

  try {
    const taskRepository = AppDataSource.getRepository(Task);

    const queryBuilder = taskRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.label', 'label')
      .leftJoinAndSelect('task.assignees', 'assignees')
      .where('task.projectId = :projectId', { projectId: parseInt(projectId) });

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (sprintId !== undefined) {
      const sprintIdNumber = parseInt(sprintId.toString())
      if (sprintIdNumber === 0) {
        // Фильтр для задач без спринта (sprintId IS NULL)
        queryBuilder.andWhere('task.sprintId IS NULL');
      } else {
        // Фильтр для задач с указанным sprintId
        queryBuilder.andWhere('task.sprintId = :sprintId', { sprintId: sprintIdNumber });
      }
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('task.title LIKE :search', { search: `%${search}%` })
            .orWhere('task.description LIKE :search', { search: `%${search}%` })
            .orWhere('task.type LIKE :search', { search: `%${search}%` })
            .orWhere('task.status LIKE :search', { search: `%${search}%` })
            .orWhere('task.priority LIKE :search', { search: `%${search}%` });
        })
      );
    }

    if (assignee) {
      const assigneeIds = (assignee as string).split(',');
      queryBuilder.andWhere('assignees.id IN (:...assigneeIds)', { assigneeIds });
    }

    if (tags) {
      const tagsArray = (tags as string).split(',');
      queryBuilder.andWhere(
        new Brackets(qb => {
          tagsArray.forEach(tag => {
            qb.orWhere(':tag = ANY(task.tags)', { tag });
          });
        })
      );
    }

    const [tasks, count] = await queryBuilder
      .skip((Number(page) - 1) * Number(pageSize))
      .take(Number(pageSize))
      .getManyAndCount();

    const tasksWithAssigneeIds = tasks.map(task => ({
      ...task,
      assignees: task.assignees.map(assignee => assignee.id),
    }));

    res.json({ tasks: tasksWithAssigneeIds, total: count });
  } catch (err: any) {
    res.status(400).json({ error: err.message, stack: err.stack });
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
  const { title, description, status, assignees: assigneeIds, labelId, dueDate, priority, estimatedTime, type, plannedDate, relatedTaskId, actualTime, tags, customFields, sprintId } = req.body;
  const userId = req.session.user!.id;

  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const labelRepository = AppDataSource.getRepository(Label);
    const projectRepository = AppDataSource.getRepository(Project);
    const projectUserRepository = AppDataSource.getRepository(ProjectUser);
    const sprintRepository = AppDataSource.getRepository(Sprint);

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
      estimatedTime: estimatedTime ?? 0,
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

    if (sprintId) {
      const sprint = await sprintRepository.findOne({ where: { id: parseInt(sprintId) } }) ;
      if (!sprint) {
        return res.status(404).json({ error: 'Sprint not found' });
      }
      newTask.sprint = sprint;
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
  const { title, description, status, assignees: assigneeIds, labelId, dueDate, priority, estimatedTime, type, plannedDate, relatedTaskId, actualTime, tags, customFields, sprintId } = req.body;
  const userId = req.session.user!.id;

  try {
    const taskRepository = AppDataSource.getRepository(Task);
    const labelRepository = AppDataSource.getRepository(Label);
    const projectUserRepository = AppDataSource.getRepository(ProjectUser);
    const sprintRepository = AppDataSource.getRepository(Sprint);

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
      if (sprintId !== undefined) {
        if(sprintId === null) {
          updatedFields.sprint = null;
        } else {
          const sprint = await sprintRepository.findOne({ where: { id: parseInt(sprintId) } }) ;
          if (!sprint) {
            return res.status(404).json({ error: 'Sprint not found' });
          }
          updatedFields.sprint = sprint;
        }

      }

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
