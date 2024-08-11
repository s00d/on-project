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
  Middlewares, Security
} from 'tsoa';
import { Sprint } from '../models/Sprint';
import { Project } from '../models/Project';
import { Roadmap } from '../models/Roadmap';
import { AppDataSource } from '../ormconfig';
import { io } from '../index';
import { authenticateAll } from '../middlewares/authMiddleware';
import { isProjectCreator } from '../middlewares/roleMiddleware';

interface CreateSprintRequest {
  title: string;
  description?: string;
  startDate: string; // ISO8601 date string
  endDate: string;   // ISO8601 date string
}

interface UpdateSprintRequest {
  title?: string;
  description?: string;
  startDate?: string; // ISO8601 date string
  endDate?: string;   // ISO8601 date string
}

@Route('api/sprints')
@Tags('Sprints')
@Security('session')
@Security('apiKey')
export class SprintController extends Controller {
  private readonly sprintRepository = AppDataSource.getRepository(Sprint);
  private readonly projectRepository = AppDataSource.getRepository(Project);
  private readonly roadmapRepository = AppDataSource.getRepository(Roadmap);

  /**
   * Get all sprints for a roadmap within a project
   * @param projectId ID of the project
   * @param roadmapId ID of the roadmap
   */
  @Get('{projectId}/{roadmapId}')
  @Middlewares([
    authenticateAll
  ])
  public async getSprints(
    @Path() projectId: number,
    @Path() roadmapId: number,
  ): Promise<Sprint[]> {
    try {
      const project = await this.projectRepository.findOne({ where: { id: projectId } });

      if (!project) {
        this.setStatus(404);
        throw new Error('Project not found');
      }

      const roadmap = await this.roadmapRepository.findOne({ where: { id: roadmapId } });

      if (!roadmap) {
        this.setStatus(404);
        throw new Error('Roadmap not found');
      }

      return this.sprintRepository
        .createQueryBuilder('sprint')
        .leftJoinAndSelect('sprint.tasks', 'task') // Join tasks with sprint
        .where('sprint.roadmapId = :roadmapId', { roadmapId })
        .andWhere('sprint.projectId = :projectId', { projectId })
        .getMany();
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error getting sprints: ${err.message}`);
    }
  }

  /**
   * Create a new sprint
   * @param projectId ID of the project
   * @param roadmapId
   * @param requestBody Sprint details
   */
  @Post('{projectId}/{roadmapId}')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  @SuccessResponse(201, 'Sprint created')
  public async createSprint(
    @Path() projectId: number,
    @Path() roadmapId: number,
    @Body() requestBody: CreateSprintRequest,
  ): Promise<Sprint> {
    try {
      const { title, description, startDate, endDate } = requestBody;
      const project = await this.projectRepository.findOne({ where: { id: projectId } });

      if (!project) {
        this.setStatus(404);
        throw new Error('Project not found');
      }

      const roadmap = await this.roadmapRepository.findOne({ where: { id: roadmapId } });

      if (!roadmap) {
        this.setStatus(404);
        throw new Error('Roadmap not found');
      }

      const sprint = this.sprintRepository.create({
        title,
        description,
        startDate,
        endDate,
        roadmap,
        project
      });
      await this.sprintRepository.save(sprint);
      io.emit('sprint:create', sprint);
      return sprint;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error creating sprint: ${err.message}`);
    }
  }

  /**
   * Update a sprint
   * @param projectId ID of the project
   * @param id ID of the sprint
   * @param requestBody Sprint details to update
   */
  @Put('{projectId}/{id}')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  public async updateSprint(
    @Path() projectId: number,
    @Path() id: number,
    @Body() requestBody: UpdateSprintRequest,
  ): Promise<Sprint> {
    try {
      const { title, description, startDate, endDate } = requestBody;
      const sprint = await this.sprintRepository.findOne({ where: { id } });

      if (!sprint) {
        this.setStatus(404);
        throw new Error('Sprint not found');
      }

      sprint.title = title ?? sprint.title;
      sprint.description = description ?? sprint.description;
      if (startDate) sprint.startDate = new Date(startDate);
      if (endDate) sprint.endDate = new Date(endDate);
      await this.sprintRepository.save(sprint);
      io.emit('sprint:update', sprint);
      return sprint;
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error updating sprint: ${err.message}`);
    }
  }

  /**
   * Delete a sprint
   * @param projectId ID of the project
   * @param id ID of the sprint
   */
  @Delete('{projectId}/{id}')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  @SuccessResponse(204, 'Sprint deleted')
  public async deleteSprint(
    @Path() projectId: number,
    @Path() id: number,
  ): Promise<void> {
    try {
      const sprint = await this.sprintRepository.findOne({ where: { id } });

      if (!sprint) {
        this.setStatus(404);
        throw new Error('Sprint not found');
      }

      await this.sprintRepository.remove(sprint);
      io.emit('sprint:delete', { id });
    } catch (err: any) {
      this.setStatus(400);
      throw new Error(`Error deleting sprint: ${err.message}`);
    }
  }
}
