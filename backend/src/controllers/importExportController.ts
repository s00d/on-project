import {
  Controller,
  Post,
  Get,
  Route,
  Body,
  UploadedFile,
  SuccessResponse,
  Middlewares,
  Security,
  Tags,
  Path,
  Request,
} from 'tsoa';
import { readFileSync } from 'fs';
import axios from 'axios';
import { AppDataSource } from '../ormconfig';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { authenticateAll } from '../middlewares/authMiddleware';
import multer from 'multer';
import {isProjectCreator} from "../middlewares/roleMiddleware";
import {Request as ExpressRequest} from "express";

const upload = multer({ dest: 'uploads/' }).single('file');

interface GitHubProject {
  id: number;
  name: string;
  columns_url: string;
}

interface GitHubColumn {
  id: number;
  name: string;
  cards_url: string;
}

interface GitHubCard {
  id: number;
  note: string | null;
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
        throw new Error('Project not found')
      }

      const data = { project };

      this.setHeader('Content-Disposition', 'attachment; filename=data.json');
      this.setHeader('Content-Type', 'application/json');
      return data;
    } catch (err: any) {
      throw new Error('An error occurred during export')
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
      data.ownerId = userId

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
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  @SuccessResponse('200', 'Data imported from GitHub successfully')
  public async importFromGitHub(
    @Body() body: {
      token: string;
      repoUrl: string;
      projectId: number;
    }
  ): Promise<{ message: string }> {
    const { token, repoUrl, projectId } = body;
    try {
      const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

      const { data: projects } = await axios.get<GitHubProject[]>(
        `https://api.github.com/repos/${owner}/${repo}/projects`,
        {
          headers: { Authorization: `token ${token}` }
        }
      );

      const taskRepository = AppDataSource.getRepository(Task);
      const projectRepository = AppDataSource.getRepository(Project);

      const project = await projectRepository.findOne({ where: { id: projectId } });

      if (!project) {
        throw new Error('Project not found');
      }

      for (const githubProject of projects) {
        const { data: columns } = await axios.get<GitHubColumn[]>(githubProject.columns_url, {
          headers: { Authorization: `token ${token}` }
        });

        for (const column of columns) {
          const { data: cards } = await axios.get<GitHubCard[]>(column.cards_url, {
            headers: { Authorization: `token ${token}` }
          });

          for (const card of cards) {
            if (!card.note) {
              continue; // Skip cards without a note
            }

            const task = taskRepository.create({
              title: card.note as string,
              description: card.note,
              status: column.name,
              project: project,
              assignees: [],
              priority: 'Medium'
            });

            await taskRepository.save(task);
          }
        }
      }

      return { message: 'Data imported from GitHub successfully' };
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
