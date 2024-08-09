import { Request, Response } from 'express';
import { Label } from '../models/Label';
import { AppDataSource } from '../ormconfig';
import {Project} from "../models/Project";

const getLabels = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const labelRepository = AppDataSource.getRepository(Label);

    const labels = await labelRepository.createQueryBuilder('label')
      .where('label.projectId = :projectId', { projectId: parseInt(projectId) })
      .getMany();

    res.json(labels);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const createLabel = async (req: Request, res: Response) => {
  const { name, color } = req.body;
  const userId = req.session.user!.id;
  const { projectId } = req.params;

  try {
    const labelRepository = AppDataSource.getRepository(Label);

    const label = labelRepository.create({ name, color, project: { id: parseInt(projectId) }, user: { id: userId } });
    await labelRepository.save(label);
    res.json(label);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const updateLabel = async (req: Request, res: Response) => {
  const { id, projectId } = req.params;
  const { name, color } = req.body;
  const userId = req.session.user!.id;

  try {
    const labelRepository = AppDataSource.getRepository(Label);

    const label = await labelRepository.findOne({ where: { id: parseInt(id), project: { id: parseInt(projectId) }, user: { id: userId } } });
    if (label) {
      label.name = name;
      label.color = color;
      await labelRepository.save(label);
      res.json(label);
    } else {
      res.status(404).json({ error: 'Label not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const deleteLabel = async (req: Request, res: Response) => {
  const { id, projectId } = req.params;
  const userId = req.session.user!.id;

  try {
    const labelRepository = AppDataSource.getRepository(Label);

    const label = await labelRepository.findOne({ where: { id: parseInt(id), project: { id: parseInt(projectId) }, user: { id: userId } } });
    if (label) {
      await labelRepository.remove(label);
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Label not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { getLabels, createLabel, updateLabel, deleteLabel };
