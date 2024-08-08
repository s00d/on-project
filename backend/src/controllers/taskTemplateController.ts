import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { TaskTemplate } from '../models/TaskTemplate';

const getTemplates = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!.id;
    const taskTemplateRepository = AppDataSource.getRepository(TaskTemplate);
    const templates = await taskTemplateRepository.find({
      where: { user: { id: userId } },
    });
    res.json(templates);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const createTemplate = async (req: Request, res: Response) => {
  const { title, description, priority, status, tag, type } = req.body;
  const userId = req.session.user!.id;
  try {
    const taskTemplateRepository = AppDataSource.getRepository(TaskTemplate);
    const newTemplate = taskTemplateRepository.create({
      title,
      description,
      priority,
      status,
      tag,
      type,
      user: { id: userId },
    });
    const template = await taskTemplateRepository.save(newTemplate);
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
    const taskTemplateRepository = AppDataSource.getRepository(TaskTemplate);
    const template = await taskTemplateRepository.findOne({
      where: {
        user: { id: userId },
        id: parseInt(id),
      },
    });
    if (template) {
      await taskTemplateRepository.remove(template);
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
