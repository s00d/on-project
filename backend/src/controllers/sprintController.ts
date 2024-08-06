import { Request, Response } from 'express';
import { Sprint } from '../models';
import { io } from '../index';

const getSprints = async (req: Request, res: Response) => {
  const roadmapId = req.params.roadmapId;
  const sprints = await Sprint.findAll({ where: { roadmapId } });
  res.json(sprints);
};

const createSprint = async (req: Request, res: Response) => {
  const { title, description, startDate, endDate, roadmapId } = req.body;
  try {
    const sprint = await Sprint.create({ title, description, startDate, endDate, roadmapId });
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
    const sprint = await Sprint.findByPk(id);
    if (sprint) {
      await sprint.update({ title, description, startDate, endDate });
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
    const sprint = await Sprint.findByPk(id);
    if (sprint) {
      await sprint.destroy();
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
