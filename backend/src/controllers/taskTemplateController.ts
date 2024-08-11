import {
  Controller,
  Get,
  Post,
  Delete,
  Route,
  Tags,
  Path,
  Body,
  Response,
  SuccessResponse,
  Security,
  Request
} from 'tsoa';
import { AppDataSource } from '../ormconfig';
import { TaskTemplate } from '../models/TaskTemplate';
import { Request as ExpressRequest } from "express";

@Route('api/task-templates')
@Tags('Task Templates')
@Security('session')
@Security('apiKey')
export class TaskTemplateController extends Controller {

  /**
   * @summary Get all task templates for the authenticated user
   */
  @Get('/')
  @Response(400, 'Bad request')
  @SuccessResponse(200, 'List of task templates')
  public async getTemplates(@Request() req: ExpressRequest): Promise<TaskTemplate[]> {
    try {
      const userId = req.session.user!.id; // Assuming user is attached to request
      const taskTemplateRepository = AppDataSource.getRepository(TaskTemplate);
      const templates = await taskTemplateRepository.find({
        where: { user: { id: userId } }
      });
      return templates;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(err.message);
    }
  }

  /**
   * @summary Create a new task template
   * @param req
   * @param requestBody - Task template data
   */
  @Post('/')
  @Response(400, 'Bad request')
  @SuccessResponse(201, 'Task template created successfully')
  public async createTemplate(
    @Request() req: ExpressRequest,
    @Body() requestBody: {
      title: string;
      description?: string;
      priority?: 'Low' | 'Medium' | 'High';
      status?: string;
      tag?: string;
      type?: string;
    }
  ): Promise<TaskTemplate> {
    const { title, description, priority, status, tag, type } = requestBody;
    try {
      const userId = req.session.user!.id; // Assuming user is attached to request
      const taskTemplateRepository = AppDataSource.getRepository(TaskTemplate);
      const newTemplate = taskTemplateRepository.create({
        title,
        description,
        priority,
        status,
        tag,
        type,
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
   * @param req
   * @param id - ID of the task template
   */
  @Delete('{id}')
  @Response(404, 'Template not found')
  @Response(400, 'Bad request')
  @SuccessResponse(204, 'Task template deleted successfully')
  public async deleteTemplate(
    @Request() req: ExpressRequest,
    @Path() id: number,
  ): Promise<void> {
    try {
      const userId = req.session.user!.id; // Assuming user is attached to request
      const taskTemplateRepository = AppDataSource.getRepository(TaskTemplate);
      const template = await taskTemplateRepository.findOne({
        where: {
          user: { id: userId },
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
