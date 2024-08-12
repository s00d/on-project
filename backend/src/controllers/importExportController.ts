import {
  Controller,
  Post,
  Get,
  Route,
  Body,
  UploadedFile,
  Middlewares,
  Security,
  Tags,
  Path,
  Request,
} from 'tsoa';
import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AppDataSource } from '../ormconfig';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { authenticateAll } from '../middlewares/authMiddleware';
import { isProjectCreator } from "../middlewares/roleMiddleware";
import { Request as ExpressRequest } from "express";

const execAsync = promisify(exec);

interface GitHubImportBody {
  token: string;
  organization: string; // URL проекта GitHub
  projectNumber: number; // URL проекта GitHub
  userMapping: { [key: string]: number }; // Сопоставление GitHub username -> User ID
}

@Route('api/import-export')
@Tags('Import Export')
@Security('session')
@Security('apiKey')
export class ImportExportController extends Controller {

  @Get('{projectId}/export')
  @Middlewares([authenticateAll, isProjectCreator])
  public async exportData(
    @Path() projectId: number,
  ): Promise<{ project: Project }> {
    try {
      const projectRepository = AppDataSource.getRepository(Project);

      const project = await projectRepository.findOne({
        where: { id: projectId },
        relations: ['tasks'],
      });

      if (!project) {
        throw new Error('Project not found');
      }

      const data = { project };

      this.setHeader('Content-Disposition', 'attachment; filename=data.json');
      this.setHeader('Content-Type', 'application/json');
      return data;
    } catch (err: any) {
      throw new Error('An error occurred during export');
    }
  }

  @Post('{projectId}/import')
  @Middlewares([authenticateAll, isProjectCreator])
  public async importData(
    @Request() req: ExpressRequest,
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<{ message: string }> {
    try {
      const userId = req.session.user!.id;

      const data = JSON.parse(readFileSync(file.path, 'utf-8'));

      const projectRepository = AppDataSource.getRepository(Project);
      const taskRepository = AppDataSource.getRepository(Task);
      data.ownerId = userId;

      // Сохранение проекта
      const savedProject = await projectRepository.save(data.project);

      // Сохранение задач, которые не привязаны к спринтам
      for (const task of data.project.tasks) {
        task.project = savedProject;
        await taskRepository.save(task);
      }

      return { message: 'Data imported successfully' };
    } catch (err: any) {
      throw new Error(`Failed to import data: ${err.message}`);
    }
  }

  @Post('{projectId}/github-import')
  @Security('apiKey')
  public async importFromGitHub(
    @Path() projectId: number,
    @Body() body: GitHubImportBody
  ): Promise<{ message: string }> {
    const { token, organization, projectNumber, userMapping } = body;
    try {

      const projectRepository = AppDataSource.getRepository(Project);
      const taskRepository = AppDataSource.getRepository(Task);

      const project = await projectRepository.findOne({ where: { id: projectId } });
      if (!project) {
        throw new Error('Проект не найден');
      }

      // Формирование команды gh для выполнения GraphQL-запроса
      const query = `
        query($org: String!, $num: Int!) {
          organization(login: $org) {
            projectV2(number: $num) {
              items(first: 100) {
                nodes {
                  content {
                    ... on Issue {
                      title
                      body
                      state
                      assignees(first: 10) {
                        nodes {
                          login
                        }
                      }
                    }
                    ... on PullRequest {
                      title
                      body
                      state
                      assignees(first: 10) {
                        nodes {
                          login
                        }
                      }
                    }
                    ... on DraftIssue {
                      title
                      body
                    }
                  }
                }
              }
            }
          }
        }
      `;

      // Выполнение команды gh
      const command = `gh api graphql -f query='${query}' -F org='${organization}' -F num=${projectNumber}`;
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        throw new Error(`Ошибка выполнения команды: ${stderr}`);
      }

      const response = JSON.parse(stdout);
      const items = response.data.organization.projectV2.items.nodes;

      for (const item of items) {
        const content = item.content;
        const assignees = content.assignees?.nodes || [];
        let status = content.state;

        // Проверка, существует ли статус в массиве статусов проекта
        let statuses: string[]|string = project.statuses;
        if (typeof statuses === 'string') {
          statuses = JSON.parse(project.statuses || '[]');
        }
        if (!project.statuses.includes(status)) {
          status = 'To Do'
          // Если статус отсутствует, добавляем его
        }

        const task = taskRepository.create({
          title: content.title,
          description: content.body,
          status: status, // Используем статус из GitHub
          project,
          assignees: assignees.map((a: any) => userMapping[a.login]).filter(Boolean),
          priority: 'Medium',
        });

        await taskRepository.save(task);
      }

      return { message: 'Данные успешно импортированы из GitHub' };
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message);
    }
  }
}
