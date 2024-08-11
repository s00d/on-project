import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppDataSource } from '../ormconfig';
import { Project } from '../models/Project';
import { ValidateError } from '@tsoa/runtime';

const authenticateJWT = async (req: Request): Promise<User> => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as User;
      return decoded;
    } catch (err) {
      throw new ValidateError({ token: { message: 'Invalid token' } }, 'Invalid token');
    }
  }
  throw new ValidateError({ token: { message: 'No token provided' } }, 'No token provided');
};

const authenticateSession = async (req: Request): Promise<User> => {
  if (req.session && req.session.user) {
    return req.session.user;
  }
  throw new ValidateError({ session: { message: 'No session found' } }, 'No session found');
};

const authenticateTokenInDB = async (req: Request): Promise<User> => {
  const apikey = req.header('Authorization')?.split(' ')[1];

  if (apikey) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { apikey } });

      if (!user) {
        throw new ValidateError({ apikey: { message: 'User not found in DB' } }, 'User not found in DB');
      }

      return user;
    } catch (err) {
      throw new ValidateError({ apikey: { message: 'Invalid token' } }, 'Invalid token');
    }
  }
  throw new ValidateError({ apikey: { message: 'No token provided' } }, 'No token provided');
};

const checkProject = async (req: Request, userId: number): Promise<Project | null> => {
  const { projectId } = req.params;
  if (projectId) {
    const projectRepository = AppDataSource.getRepository(Project);
    try {
      const project = await projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.projectUsers', 'projectUser')
        .where('project.id = :projectId', { projectId })
        .andWhere('(project.ownerId = :userId OR projectUser.userId = :userId)', { userId })
        .getOne();

      if (project) {
        // Проверка, если пользователь является владельцем проекта
        if (project.ownerId === userId) {
          return project
        }

        // Проверка, если пользователь связан с проектом через projectUser
        if (project.projectUsers && project.projectUsers) {
          return project
        }
      }

      throw new ValidateError({ projectId: { message: 'You do not have access to this project' } }, 'Unauthorized');
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new ValidateError({}, 'Internal Server Error');
    }
  }

  return null;
};

const authenticateAll = async (req: Request, res: Response, next: NextFunction) => {
  return next();
  try {
    req.session.user = await authenticateSession(req);
    if(req.session?.user) req.session.project = await checkProject(req, req.session.user!.id);
    return next();
  } catch (err) {
    // Ignore error and try next method
  }

  try {
    req.session.user = await authenticateJWT(req);
    if(req.session?.user) req.session.project = await checkProject(req, req.session.user!.id);
    return next();
  } catch (err) {
    // Ignore error and try next method
  }

  try {
    req.session.user = await authenticateTokenInDB(req);
    if(req.session?.user) req.session.project = await checkProject(req, req.session.user!.id);
    return next();
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export { authenticateAll };
