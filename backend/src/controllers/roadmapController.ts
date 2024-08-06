import { Request, Response } from 'express';
import { Roadmap } from '../models';
import { io } from '../index';

const getRoadmaps = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  const roadmaps = await Roadmap.findAll({ where: { projectId } });
  res.json(roadmaps);
};

const createRoadmap = async (req: Request, res: Response) => {
  const { title, description, projectId } = req.body;
  try {
    const roadmap = await Roadmap.create({ title, description, projectId });
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
    const roadmap = await Roadmap.findByPk(id);
    if (roadmap) {
      await roadmap.update({ title, description });
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
    const roadmap = await Roadmap.findByPk(id);
    if (roadmap) {
      await roadmap.destroy();
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
