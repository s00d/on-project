import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { Roadmap } from '../models/Roadmap';
import { io } from '../index';

const getRoadmaps = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  try {
    const roadmapRepository = AppDataSource.getRepository(Roadmap);
    const roadmaps = await roadmapRepository.find({ where: { project: { id: parseInt(projectId) } } });
    res.json(roadmaps);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const createRoadmap = async (req: Request, res: Response) => {
  const { title, description, projectId } = req.body;
  try {
    const roadmapRepository = AppDataSource.getRepository(Roadmap);
    const roadmap = roadmapRepository.create({ title, description, project: { id: parseInt(projectId) } });
    await roadmapRepository.save(roadmap);
    io.emit('roadmap:create', roadmap);
    res.json(roadmap);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const updateRoadmap = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    const roadmapRepository = AppDataSource.getRepository(Roadmap);
    const roadmap = await roadmapRepository.findOne({ where: { id: parseInt(id) } });
    if (roadmap) {
      roadmap.title = title;
      roadmap.description = description;
      await roadmapRepository.save(roadmap);
      io.emit('roadmap:update', roadmap);
      res.json(roadmap);
    } else {
      res.status(404).json({ error: 'Roadmap not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const deleteRoadmap = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const roadmapRepository = AppDataSource.getRepository(Roadmap);
    const roadmap = await roadmapRepository.findOne({ where: { id: parseInt(id) } });
    if (roadmap) {
      await roadmapRepository.remove(roadmap);
      io.emit('roadmap:delete', { id: Number(id) });
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Roadmap not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { getRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap };
