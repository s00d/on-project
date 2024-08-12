import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Path,
  Body,
  SuccessResponse,
  Route,
  Tags,
  Request,
  Middlewares, Security
} from 'tsoa';
import { Roadmap } from '../models/Roadmap';
import { Project } from '../models/Project';
import { AppDataSource } from '../ormconfig';
import { io } from '../index';
import { Request as ExpressRequest } from 'express';
import { authenticateAll } from '../middlewares/authMiddleware';
import { isProjectCreator } from '../middlewares/roleMiddleware';

interface CreateRoadmapRequest {
  title: string;
  description?: string;
}

interface UpdateRoadmapRequest {
  title?: string;
  description?: string;
}

@Route('api/roadmaps')
@Tags('Roadmaps')
@Security('session')
@Security('apiKey')
export class RoadmapController extends Controller {
  private readonly roadmapRepository = AppDataSource.getRepository(Roadmap);
  private readonly projectRepository = AppDataSource.getRepository(Project);

  @Get('{projectId}')
  @Middlewares([
    authenticateAll
  ])
  public async getRoadmaps(
    @Request() req: ExpressRequest,
    @Path() projectId: number,
  ): Promise<Roadmap[]> {
    try {
      const userId = req.session.user!.id;

      const project = await this.projectRepository
        .createQueryBuilder('project')
        .innerJoin('project.projectUsers', 'projectUser', 'projectUser.userId = :userId', { userId })
        .where('project.id = :projectId', { projectId })
        .getOne();

      if (!project) {
        this.setStatus(404);
        throw new Error('Project not found');
      }

      return this.roadmapRepository.find({
        where: { project: { id: projectId } }
      });
    } catch (err: any) {
      this.setStatus(404);
      throw new Error(`Error getting roadmaps: ${err.message}`);
    }
  }

  @Post('{projectId}')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  @SuccessResponse(201, 'Roadmap created')
  public async createRoadmap(
    @Path() projectId: number,
    @Body() requestBody: CreateRoadmapRequest,
  ): Promise<Roadmap> {
    try {
      const { title, description } = requestBody;
      const project = await this.projectRepository.findOne({ where: { id: projectId } });

      if (!project) {
        this.setStatus(404);
        throw new Error('Project not found');
      }

      const roadmap = this.roadmapRepository.create({ title, description, project });
      await this.roadmapRepository.save(roadmap);
      io.to(`project:${project.id}`).emit('roadmap:create', roadmap);
      return roadmap;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error creating roadmap: ${err.message}`);
    }
  }

  @Put('{projectId}/{id}')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  public async updateRoadmap(
    @Path() projectId: number,
    @Path() id: number,
    @Body() requestBody: UpdateRoadmapRequest,
  ): Promise<Roadmap> {
    try {
      const { title, description } = requestBody;
      const roadmap = await this.roadmapRepository.findOne({ where: { id } });

      if (!roadmap) {
        this.setStatus(404);
        throw new Error('Roadmap not found');
      }

      roadmap.title = title ?? roadmap.title;
      roadmap.description = description ?? roadmap.description;
      await this.roadmapRepository.save(roadmap);
      io.to(`project:${projectId}`).emit('roadmap:update', roadmap);
      return roadmap;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error updating roadmap: ${err.message}`);
    }
  }

  @Delete('{projectId}/{id}')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  @SuccessResponse(204, 'Roadmap deleted')
  public async deleteRoadmap(
    @Path() projectId: number,
    @Path() id: number,
  ): Promise<void> {
    try {
      const roadmap = await this.roadmapRepository.findOne({ where: { id } });

      if (!roadmap) {
        this.setStatus(404);
        throw new Error('Roadmap not found');
      }

      await this.roadmapRepository.remove(roadmap);
      io.to(`project:${projectId}`).emit('roadmap:delete', { id });
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error deleting roadmap: ${err.message}`);
    }
  }
}
