import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Sprint } from '../models/Sprint';
import { io } from '../index';
import {Project} from "../models/Project";
import {Roadmap} from "../models/Roadmap";

const getSprints = async (req: Request, res: Response) => {
  const { projectId, roadmapId } = req.params;
  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const sprintRepository = AppDataSource.getRepository(Sprint);
    const roadmapRepository = AppDataSource.getRepository(Roadmap);

    const project = await projectRepository.findOne({ where: { id: parseInt(projectId) } });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const roadmap = await roadmapRepository.findOne({ where: { id: parseInt(roadmapId) } });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    const sprints = await sprintRepository
      .createQueryBuilder('sprint')
      .leftJoinAndSelect('sprint.tasks', 'task')  // Join tasks with sprint
      .where('sprint.roadmapId = :roadmapId', { roadmapId: parseInt(roadmapId) })
      .andWhere('sprint.projectId = :projectId', { projectId: parseInt(projectId) })
      .getMany();

    res.json(sprints);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const createSprint = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, description, startDate, endDate, roadmapId } = req.body;
  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const sprintRepository = AppDataSource.getRepository(Sprint);
    const roadmapRepository = AppDataSource.getRepository(Roadmap);

    const project = await projectRepository.findOne({ where: { id: parseInt(projectId) } });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const roadmap = await roadmapRepository.findOne({ where: { id: parseInt(roadmapId) } });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    const sprint = sprintRepository.create({ title, description, startDate, endDate, roadmap, project });
    await sprintRepository.save(sprint);
    io.emit('sprint:create', sprint);
    res.json(sprint);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const updateSprint = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, startDate, endDate } = req.body;
  try {
    const sprintRepository = AppDataSource.getRepository(Sprint);
    const sprint = await sprintRepository.findOne({ where: { id: parseInt(id) } });
    if (sprint) {
      sprint.title = title;
      sprint.description = description;
      sprint.startDate = startDate;
      sprint.endDate = endDate;
      await sprintRepository.save(sprint);
      io.emit('sprint:update', sprint);
      res.json(sprint);
    } else {
      res.status(404).json({ error: 'Sprint not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const deleteSprint = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const sprintRepository = AppDataSource.getRepository(Sprint);
    const sprint = await sprintRepository.findOne({ where: { id: parseInt(id) } });
    if (sprint) {
      await sprintRepository.remove(sprint);
      io.emit('sprint:delete', { id: Number(id) });
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Sprint not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { getSprints, createSprint, updateSprint, deleteSprint };
