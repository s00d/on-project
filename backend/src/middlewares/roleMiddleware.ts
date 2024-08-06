import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models';
import { Role } from '../models';
import { Project } from '../models';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const checkRole = (...requiredRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const projectId = req.params.projectId || req.body.projectId;

    // Найдите все пользовательские роли, связанные с данным проектом
    const userRoles = await UserRole.findAll({ where: { userId, projectId }, include: [Role] });

    // Проверьте, есть ли у пользователя хотя бы одна из требуемых ролей
    const hasRole = userRoles.some(ur => requiredRoles.includes(ur.role!.name));

    if (hasRole) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  };
};


const isProjectCreator = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const projectId = req.params.projectId || req.body.projectId;

  const project = await Project.findByPk(projectId);
  if (project && project.ownerId === userId) { // Убедитесь, что используется правильное поле для владельца проекта
    next();
  } else {
    res.status(403).json({ error: 'Only project creator can perform this action' });
  }
};

export { checkRole, isProjectCreator };
