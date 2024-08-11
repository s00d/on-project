import {Controller, Get, Post, Put, Delete, Route, Path, Body, Request, Middlewares, Security, Tags} from 'tsoa';
import { Label } from '../models/Label';
import { AppDataSource } from '../ormconfig';
import { Request as ExpressRequest } from 'express';
import { authenticateAll } from '../middlewares/authMiddleware';
import {isProjectCreator} from "../middlewares/roleMiddleware";

@Route('api/labels')
@Tags('Labels')
@Security('session')
@Security('apiKey')
export class LabelController extends Controller {

  @Get('{projectId}/')
  @Middlewares([
    authenticateAll
  ])
  public async getLabels(
    @Path() projectId: number
  ): Promise<Label[]> {
    try {
      const labelRepository = AppDataSource.getRepository(Label);
      return await labelRepository
        .createQueryBuilder('label')
        .where('label.projectId = :projectId', { projectId })
        .getMany();
    } catch (err: any) {
      throw new Error(`Error fetching labels: ${err.message}`);
    }
  }

  @Post('{projectId}/')
  @Middlewares([
    authenticateAll
  ])
  public async createLabel(
    @Request() req: ExpressRequest,
    @Path() projectId: number,
    @Body() requestBody: { name: string, color: string }
  ): Promise<Label> {
    try {
      const { name, color } = requestBody;
      const userId = req.session.user!.id;

      const labelRepository = AppDataSource.getRepository(Label);

      const label = labelRepository.create({
        name,
        color,
        project: { id: projectId },
        user: { id: userId }
      });

      return await labelRepository.save(label);
    } catch (err: any) {
      throw new Error(`Error creating label: ${err.message}`);
    }
  }

  @Put('{projectId}/{id}')
  @Middlewares([
    authenticateAll
  ])
  public async updateLabel(
    @Request() req: ExpressRequest,
    @Path() id: number,
    @Path() projectId: number,
    @Body() requestBody: { name: string, color: string }
  ): Promise<Label> {
    try {
      const { name, color } = requestBody;
      const userId = req.session.user!.id;

      const labelRepository = AppDataSource.getRepository(Label);

      const label = await labelRepository.findOne({
        where: { id, project: { id: projectId }, user: { id: userId } }
      });

      if (!label) {
        throw new Error('Label not found');
      }

      label.name = name;
      label.color = color;

      return await labelRepository.save(label);
    } catch (err: any) {
      throw new Error(`Error updating label: ${err.message}`);
    }
  }

  @Delete('{projectId}/{id}')
  @Middlewares([
    authenticateAll,
    isProjectCreator
  ])
  public async deleteLabel(
    @Request() req: ExpressRequest,
    @Path() id: number,
    @Path() projectId: number
  ): Promise<void> {
    try {
      const userId = req.session.user!.id;

      const labelRepository = AppDataSource.getRepository(Label);

      const label = await labelRepository.findOne({
        where: { id, project: { id: projectId }, user: { id: userId } }
      });

      if (!label) {
        throw new Error('Label not found');
      }

      await labelRepository.remove(label);
    } catch (err: any) {
      throw new Error(`Error deleting label: ${err.message}`);
    }
  }
}
