import { Request, Response, NextFunction } from 'express';
import { Project } from '../models';

const isProjectCreator = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.user?.id;
  if (!userId) {
    res.status(403).json({ error: 'Access denied' });
  }
  const projectId = req.params.projectId || req.body.projectId;

  const project = await Project.findByPk(projectId);
  if (project && project.ownerId === userId) { // Убедитесь, что используется правильное поле для владельца проекта
    next();
  } else {
    res.status(403).json({ error: 'Only project creator can perform this action' });
  }
};

export { isProjectCreator };
