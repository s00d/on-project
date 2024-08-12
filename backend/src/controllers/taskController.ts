import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Tags,
  Path,
  Query,
  Body,
  Request,
  Security,
  Response,
  SuccessResponse,
  Middlewares
} from 'tsoa';
import { AppDataSource } from '../ormconfig';
import { Task } from '../models/Task';
import { Label } from '../models/Label';
import { Project } from '../models/Project';
import { ProjectUser } from '../models/ProjectUser';
import { Sprint } from '../models/Sprint';
import { Brackets, In } from 'typeorm';
import { io } from '../index';
import { logTaskHistory } from './taskHistoryController';
import { createNotification } from './notificationController';
import { Request as ExpressRequest } from 'express';
import { isEqual } from 'lodash';
import {authenticateAll} from "../middlewares/authMiddleware";
import {isProjectCreator} from "../middlewares/roleMiddleware";

interface TaskDTO {
  title: string,
  description: string,
  status?: string,
  assigneesIds?: number[],
  labelId?: number|null,
  order?: number,
  dueDate?: Date|null,
  stopDate?: null|any,
  startDate?: null|any,
  priority?: string,
  estimatedTime?: number,
  type?: string,
  plannedDate?: Date|null,
  relatedTaskId?: number|null,
  actualTime?: number,
  tags?: null|string[],
  customFields?: null|{ [name: string]: any },
  sprintId?: any|null
}

@Route('api/tasks')
@Tags('Tasks')
@Security('session')
@Security('apiKey')
export class TaskController extends Controller {

  @Get('{projectId}')
  @Response(400, 'Bad request')
  @SuccessResponse(200, 'List of tasks')
  @Middlewares([
    authenticateAll,
  ])
  public async getTasks(
    @Path() projectId: number,
    @Query() status?: string,
    @Query() priority?: string,
    @Query() search?: string,
    @Query() assignee?: string,
    @Query() tags?: string,
    @Query() sprintId?: number,
    @Query() relatedTaskId?: number,
    @Query() pageSize: number = 100,
    @Query() page: number = 1,
    @Query() startDate?: Date,
    @Query() endDate?: Date
  ): Promise<{ tasks: Task[], total: number }> {
    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const queryBuilder = taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.label', 'label')
        .leftJoinAndSelect('task.assignees', 'assignees')
        .where('task.projectId = :projectId', { projectId });

      if (status) {
        queryBuilder.andWhere('task.status = :status', { status });
      }
      if (priority) {
        queryBuilder.andWhere('task.priority = :priority', { priority });
      }
      if (sprintId !== undefined) {
        if (sprintId === 0) {
          queryBuilder.andWhere('task.sprintId IS NULL');
        } else {
          queryBuilder.andWhere('task.sprintId = :sprintId', { sprintId });
        }
      }
      if (relatedTaskId !== undefined) {
        if (sprintId === 0) {
          queryBuilder.andWhere('task.relatedTaskId IS NULL');
        } else {
          queryBuilder.andWhere('task.relatedTaskId = :relatedTaskId', { relatedTaskId });
        }
      }
      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
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
          new Brackets((qb) => {
            tagsArray.forEach((tag) => {
              qb.orWhere(':tag = ANY(task.tags)', { tag });
            });
          })
        );
      }
      if (startDate || endDate) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            if (startDate) {
              qb.orWhere('task.startDate >= :startDate', { startDate });
            }
            if (endDate) {
              qb.orWhere('task.stopDate <= :endDate', { endDate });
            }
          })
        );
      }

      queryBuilder.orderBy('task.order', 'DESC');

      const [tasks, count] = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

      return { tasks, total: count };
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  @Get('{projectId}/{id}')
  @Response(404, 'Task not found')
  @SuccessResponse(200, 'Task details')
  @Middlewares([
    authenticateAll,
  ])
  public async getTask(
    @Path() projectId: number,
    @Path() id: number
  ): Promise<Task> {
    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const task = await taskRepository.findOne({
        where: { project: { id: projectId }, id },
        relations: ['label', 'assignees']
      });
      if (!task) {
        this.setStatus(404);
        throw new Error('Task not found');
      }
      return task;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  @Post('{projectId}')
  @Response(400, 'Bad request')
  @SuccessResponse(201, 'Task created successfully')
  @Middlewares([
    authenticateAll,
  ])
  public async createTask(
    @Path() projectId: number,
    @Body() requestBody: Partial<TaskDTO>,
    @Request() req: ExpressRequest,
  ): Promise<Task> {
    const userId = req.session!.user!.id;

    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const labelRepository = AppDataSource.getRepository(Label);
      const projectRepository = AppDataSource.getRepository(Project);
      const projectUserRepository = AppDataSource.getRepository(ProjectUser);
      const sprintRepository = AppDataSource.getRepository(Sprint);

      const project = await projectRepository.findOne({ where: { id: projectId } });
      if (!project) {
        this.setStatus(404);
        throw new Error('Project not found');
      }

      const label = requestBody.labelId ? await labelRepository.findOne({ where: { id: requestBody.labelId } }) : null;
      const relatedTask = requestBody.relatedTaskId ? await taskRepository.findOne({ where: { id: requestBody.relatedTaskId } }) : null;
      const assignees = requestBody.assigneesIds ? await projectUserRepository.find({
        where: {
          user: { id: In(requestBody.assigneesIds) },
          project: { id: projectId }
        },
        relations: ['user']
      }) : [];

      const newTask: Partial<Task> = {
        ...requestBody,
        project,
        label,
        relatedTask,
        assignees,
        history: [],
        tags: requestBody.tags || [],
        customFields: requestBody.customFields || {},
        startDate: requestBody.status === 'In Progress' ? new Date() : null,
        stopDate: requestBody.status === 'In Progress' && requestBody.estimatedTime ? new Date(Date.now() + requestBody.estimatedTime * 60 * 60 * 1000) : null
      };

      if (requestBody.status === 'Done') {
        newTask.stopDate = new Date();
        if (newTask.startDate) {
          newTask.actualTime = (newTask.stopDate.getTime() - new Date(newTask.startDate).getTime()) / (60 * 60 * 1000);
        }
      }

      if (requestBody.sprintId) {
        const sprint = await sprintRepository.findOne({ where: { id: requestBody.sprintId } });
        if (!sprint) {
          this.setStatus(404);
          throw new Error('Sprint not found');
        }
        newTask.sprint = sprint;
      }

      const task = taskRepository.create(newTask);
      await taskRepository.save(task);

      // Log all fields as changes
      const changes: Record<string, { oldValue: any, newValue: any }> = {};
      const title = newTask.title ?? ''
      changes[title] = { oldValue: null, newValue: title };
      await logTaskHistory(task.id, userId, 'created', changes);

      if (assignees.length) {
        for (let assignee of assignees) {
          await createNotification(assignee.id, `You have been assigned a new task: ${requestBody.title}`);
        }
      }

      io.to(`project:${project.id}`).emit('task:create', task);
      return task;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  @Put('{projectId}/{id}')
  @Response(400, 'Bad request')
  @Response(404, 'Task not found')
  @SuccessResponse(200, 'Task updated successfully')
  @Middlewares([
    authenticateAll,
  ])
  public async updateTask(
    @Path() projectId: number,
    @Path() id: number,
    @Body() requestBody: Partial<TaskDTO>,
    @Request() req: ExpressRequest,
  ): Promise<Task> {
    const userId = req.session.user!.id;
    if (!userId) {
      this.setStatus(401);
      throw new Error('User not authenticated');
    }

    try {
      const projectUserRepository = AppDataSource.getRepository(ProjectUser);
      const taskRepository = AppDataSource.getRepository(Task);
      const task = await taskRepository.findOne({ where: { id, project: { id: projectId } } });
      if (!task) {
        this.setStatus(404);
        throw new Error('Task not found');
      }

      const changes: Record<string, { oldValue: any, newValue: any }> = {};

      for (const key of Object.keys(requestBody)) {
        if(key === 'assignees') continue;
        const oldValue = task[key as keyof Task];
        const newValue = requestBody[key as keyof TaskDTO];

        if (!isEqual(oldValue, newValue)) {
          changes[key] = {
            oldValue: Array.isArray(oldValue) ? [...oldValue] : oldValue,
            newValue: Array.isArray(newValue) ? [...newValue] : newValue,
          };
        }
      }

      const updatedTask: Task = Object.assign(task, requestBody);

      if (requestBody.status) {
        if (requestBody.status === 'Done') {
          updatedTask.stopDate = new Date();
          if (task.startDate) {
            updatedTask.actualTime = (updatedTask.stopDate.getTime() - new Date(task.startDate).getTime()) / (60 * 60 * 1000);
          }
        } else if (requestBody.status === 'In Progress' && !task.startDate) {
          updatedTask.startDate = new Date();
        }
      }

      if (requestBody.sprintId !== undefined) {
        if (requestBody.sprintId === null) {
          updatedTask.sprint = null
        } else {
          const sprintRepository = AppDataSource.getRepository(Sprint)
          const sprint = await sprintRepository.findOne({ where: { id: parseInt(requestBody.sprintId.toString()) } })
          if (!sprint) {
            throw new Error('Sprint not found');
          }
          updatedTask.sprint = sprint
        }
      }

      if (requestBody.relatedTaskId !== undefined) {
        if (requestBody.relatedTaskId === null) {
          updatedTask.relatedTaskId = null
        } else {
          const relatedTask = await taskRepository.findOne({ where: { id: requestBody.relatedTaskId } });
          if (!relatedTask) {
            throw new Error('Related Task not found');
          }
          updatedTask.relatedTask = relatedTask
        }
      }

      if (requestBody.assigneesIds !== undefined) {
        updatedTask.assignees = await projectUserRepository.find({
          where: {
            user: { id: In(requestBody.assigneesIds) },
            project: { id: projectId }
          }
        })
      }


      await taskRepository.save(updatedTask);
      await logTaskHistory(updatedTask.id, userId, 'updated', changes);

      io.to(`project:${projectId}`).emit('task:update', updatedTask);
      return updatedTask;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  @Put('{projectId}/reorder/update')
  @Response(400, 'Bad request')
  @SuccessResponse(200, 'Tasks reordered successfully')
  @Middlewares([authenticateAll])
  public async reorderTasks(
    @Path() projectId: number,
    @Body() body: {
      draggedTaskId: number,
      targetTaskId: number,
    },
  ): Promise<void> {

    const taskRepository = AppDataSource.getRepository(Task);

    const draggedTask = await taskRepository.findOne({
      where: { id: body.draggedTaskId, project: { id: projectId } },
    });

    const targetTask = await taskRepository.findOne({
      where: { id: body.targetTaskId, project: { id: projectId } },
    });

    if (!draggedTask) {
      this.setStatus(404);
      throw new Error(`Dragged Task ${body.draggedTaskId} not found`);
    }

    if (!targetTask) {
      this.setStatus(404);
      throw new Error(`Target Task ${targetTask} not found`);
    }

    // Update the order of draggedTask
    const draggedOrder = draggedTask.order;
    draggedTask.order = targetTask.order;
    targetTask.order = draggedOrder;

    await taskRepository.save([draggedTask, targetTask]);

    io.to(`project:${projectId}`).emit(`task:reorder`);
  }

  @Delete('{projectId}/{id}')
  @Response(404, 'Task not found')
  @SuccessResponse(200, 'Task deleted successfully')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  public async deleteTask(
    @Path() projectId: number,
    @Path() id: number
  ): Promise<void> {
    try {
      const taskRepository = AppDataSource.getRepository(Task);
      const task = await taskRepository.findOne({ where: { id, project: { id: projectId } } });
      if (!task) {
        this.setStatus(404);
        return;
      }
      await taskRepository.remove(task);
      io.to(`project:${projectId}`).emit('task:delete', id);
    } catch (err: any) {
      this.setStatus(400);
    }
  }
}
