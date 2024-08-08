import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Sprint } from '../models/Sprint';
import { io } from '../index';

const getSprints = async (req: Request, res: Response) => {
  const roadmapId = req.params.roadmapId;
  try {
    const sprintRepository = AppDataSource.getRepository(Sprint);
    const sprints = await sprintRepository.find({ where: { roadmap: { id: parseInt(roadmapId) } } });
    res.json(sprints);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const createSprint = async (req: Request, res: Response) => {
  const { title, description, startDate, endDate, roadmapId } = req.body;
  try {
    const sprintRepository = AppDataSource.getRepository(Sprint);
    const sprint = sprintRepository.create({ title, description, startDate, endDate, roadmap: { id: parseInt(roadmapId) } });
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
