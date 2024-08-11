import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags
} from 'tsoa';
import {AppDataSource} from '../ormconfig';
import {TaskTemplate} from '../models/TaskTemplate';
import {Project} from '../models/Project';
import {Request as ExpressRequest} from "express";

@Route('api/task-templates')
@Tags('Task Templates')
@Security('session')
@Security('apiKey')
export class TaskTemplateController extends Controller {

  /**
   * @summary Get all task templates for the authenticated user and specific project
   */
  @Get('/{projectId}')
  @Response(400, 'Bad request')
  @SuccessResponse(200, 'List of task templates')
  public async getTemplates(
    @Path() projectId: number,
    @Request() req: ExpressRequest
  ): Promise<TaskTemplate[]> {
    try {
      const userId = req.session.user!.id; // Assuming user is attached to request
      const taskTemplateRepository = AppDataSource.getRepository(TaskTemplate);
      return await taskTemplateRepository.find({
        where: {user: {id: userId}, project: {id: projectId}}
      });
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  /**
   * @summary Create a new task template
   * @param req
   * @param projectId - ID of the project
   * @param requestBody - Task template data
   */
  @Post('/{projectId}')
  @Response(400, 'Bad request')
  @SuccessResponse(201, 'Task template created successfully')
  public async createTemplate(
    @Path() projectId: number,
    @Request() req: ExpressRequest,
    @Body() requestBody: {
      title: string;
      description?: string;
      priority?: 'Low' | 'Medium' | 'High';
      status?: string;
      tag?: string;
      type?: string;
      estimatedTime: number;
      actualTime: number;
      customFields: Record<string, string>;
      tags: string[];
    }
  ): Promise<TaskTemplate> {
    const { title, description, priority, status, tag, type } = requestBody;
    try {
      const userId = req.session.user!.id; // Assuming user is attached to request
      const projectRepository = AppDataSource.getRepository(Project);
      const project = await projectRepository.findOne({ where: { id: projectId } });
      if (!project) {
        this.setStatus(404);
        throw new Error('Project not found');
      }

      const taskTemplateRepository = AppDataSource.getRepository(TaskTemplate);
      const newTemplate = taskTemplateRepository.create({
        title,
        description,
        priority,
        status,
        tag,
        type,
        project,
        user: { id: userId }
      });
      const template = await taskTemplateRepository.save(newTemplate);
      return template;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  /**
   * @summary Delete a task template by ID
   * @param projectId - ID of the project
   * @param req
   * @param id - ID of the task template
   */
  @Delete('{projectId}/{id}')
  @Response(404, 'Template not found')
  @Response(400, 'Bad request')
  @SuccessResponse(204, 'Task template deleted successfully')
  public async deleteTemplate(
    @Path() projectId: number,
    @Request() req: ExpressRequest,
    @Path() id: number,
  ): Promise<void> {
    try {
      const userId = req.session.user!.id; // Assuming user is attached to request
      const taskTemplateRepository = AppDataSource.getRepository(TaskTemplate);
      const template = await taskTemplateRepository.findOne({
        where: {
          user: { id: userId },
          project: { id: projectId },
          id
        }
      });
      if (template) {
        await taskTemplateRepository.remove(template);
        this.setStatus(204);
      } else {
        this.setStatus(404);
        throw new Error('Template not found');
      }
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }
}
