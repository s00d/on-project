import { Request, Response } from 'express';
import {Project, TaskTemplate} from '../models';


const getTemplates = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!.id;
    const templates = await TaskTemplate.findAll({
      where: {
        userId: userId,
      }
    });
    res.json(templates);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const createTemplate = async (req: Request, res: Response) => {
  const { title, description, priority } = req.body;
  const userId = req.session.user!.id;
  try {
    const template = await TaskTemplate.create({ title, description, priority, userId });
    res.json(template);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const deleteTemplate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.session.user!.id;
  try {
    const template = await TaskTemplate.findOne({
      where: {
        userId: userId,
        id: id
      }
    });
    if (template) {
      await template.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { getTemplates, createTemplate, deleteTemplate };
