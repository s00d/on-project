import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { ProjectUser } from '../models/ProjectUser';
import { AppDataSource } from '../ormconfig';
import {User} from "../models/User";
import {Sprint} from "../models/Sprint";
import {Roadmap} from "../models/Roadmap";
import {Label} from "../models/Label";
import {Task} from "../models/Task";

const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!.id;
    const projectRepository = AppDataSource.getRepository(Project);

    const projects = await projectRepository.createQueryBuilder('project')
      // .leftJoinAndSelect('project.owner', 'owner')
      .innerJoin('project.projectUsers', 'projectUser', 'projectUser.userId = :userId', { userId })
      .getMany();

    res.json(projects);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const getProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const userId = req.session.user!.id;
    const projectRepository = AppDataSource.getRepository(Project);

    const project = await projectRepository.createQueryBuilder('project')
      .innerJoin('project.projectUsers', 'projectUser', 'projectUser.userId = :userId', { userId })
      .leftJoinAndSelect('project.sprints', 'sprint')
      .where('project.id = :projectId', { projectId })
      .getOne();

    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ error: 'Project not found or you do not have access' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const createProject = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const ownerId = req.session.user!.id;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const projectUserRepository = AppDataSource.getRepository(ProjectUser);

    const project = projectRepository.create({ name, description, owner: { id: ownerId } });
    await projectRepository.save(project);

    const projectUser = projectUserRepository.create({ project: project, user: { id: ownerId } });
    await projectUserRepository.save(projectUser);

    res.json(project);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const inviteUser = async (req: Request, res: Response) => {
  const { userId, email, username } = req.body;
  const { projectId } = req.params;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const projectUserRepository = AppDataSource.getRepository(ProjectUser);
    const userRepository = AppDataSource.getRepository(User);

    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId), owner: { id: req.session.user!.id } }
    });

    if (!project) {
      return res.status(403).json({ error: 'Only the project owner can invite users' });
    }

    let user: null|User = null;

    if (userId) {
      user = await userRepository.findOne({ where: { id: parseInt(userId) } });
    }
    if (!user && email) {
      user = await userRepository.findOne({ where: { email } });
    }
    if (!user && username) {
      user = await userRepository.findOne({ where: { username } });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingProjectUser = await projectUserRepository.findOne({
      where: { project: { id: parseInt(projectId) }, user: { id: user.id } }
    });

    if (existingProjectUser) {
      res.status(400).json({ error: 'User is already a member of the project' });
    } else {
      const projectUser = projectUserRepository.create({ project: project, user: user });
      await projectUserRepository.save(projectUser);
      res.json({ message: 'User invited successfully' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message, stack: error.stack });
  }
};

const getProjectUsers = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const projectUserRepository = AppDataSource.getRepository(ProjectUser);

    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId), owner: { id: req.session.user!.id } },
      relations: ['owner', 'projectUsers', 'projectUsers.user']
    });

    if (project) {
      const userRoles = await projectUserRepository.find({
        where: { project: { id: parseInt(projectId) } },
        relations: ['user']
      });

      // Формируем объект с ключами по ID пользователя
      const usersById: Record<number, { id: number; username: string }> = {};
      userRoles.forEach((ur) => {
        if (ur.user) {
          usersById[ur.user.id] = {
            id: ur.user.id,
            username: ur.user.username
          };
        }
      });

      res.json(usersById);
    } else {
      res.status(403).json({ error: 'Only the project owner can view project users' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const DeActiveUser = async (req: Request, res: Response) => {
  const { userId, projectId } = req.params;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const projectUserRepository = AppDataSource.getRepository(ProjectUser);

    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId), owner: { id: req.session.user!.id } }
    });

    if (project) {
      const existingProjectUser = await projectUserRepository.findOne({ where: { user: { id: parseInt(userId) }, project: { id: parseInt(projectId) } } });
      if (existingProjectUser) {
        await projectUserRepository.remove(existingProjectUser);
        res.status(204).end();
      } else {
        res.status(404).json({ error: 'User not found in project' });
      }
    } else {
      res.status(403).json({ error: 'Only the project owner can remove users from the project' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const updateProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { name, description, customFields, savedFilters, priorities, statuses, tags, types } = req.body;

  try {
    const projectRepository = AppDataSource.getRepository(Project);

    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId), owner: { id: req.session.user!.id } }
    });

    if (project) {
      project.name = name ?? project.name;
      project.description = description ?? project.description;
      project.customFields = customFields ?? project.customFields;
      project.priorities = priorities ?? project.priorities;
      project.statuses = statuses ?? project.statuses;
      project.tags = tags ?? project.tags;
      project.types = types ?? project.types;
      project.savedFilters = savedFilters ?? project.savedFilters;

      await projectRepository.save(project);
      res.json(project);
    } else {
      res.status(403).json({ error: 'Only the project owner can update the project' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const deleteProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const projectRepository = AppDataSource.getRepository(Project);
    const taskRepository = AppDataSource.getRepository(Task);
    const labelRepository = AppDataSource.getRepository(Label);
    const projectUserRepository = AppDataSource.getRepository(ProjectUser);
    const roadmapRepository = AppDataSource.getRepository(Roadmap);
    const sprintRepository = AppDataSource.getRepository(Sprint);

    const project = await projectRepository.findOne({
      where: { id: parseInt(projectId), owner: { id: req.session.user!.id } }
    });

    if (project) {
      await projectUserRepository.delete({ project: { id: project.id } });
      await projectRepository.remove(project);
      res.status(204).end();
    } else {
      res.status(403).json({ error: 'Only the project owner can delete the project' });
    }
  } catch (err: any) {
    const error = err as Error;
    error.stack
    res.status(400).json({ error: error.message, stack: error.stack });
  }
};

export {
  getProjects,
  getProject,
  createProject,
  inviteUser,
  getProjectUsers,
  DeActiveUser,
  updateProject,
  deleteProject
};
