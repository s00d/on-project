import { Request, Response } from 'express';
import { Project } from '../models';
import { ProjectUser } from '../models';
import { User } from '../models';
import {UserRole} from "../models";


const getProjects = async (req: Request, res: Response) => {
  const projects = await Project.findAll({
    where: { ownerId: req.session.user!.id },
    include: [User]
  });
  res.json(projects);
};

const createProject = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const ownerId = req.session.user!.id;

  try {
    const project = await Project.create({ name, description, ownerId });
    await ProjectUser.create({ projectId: project.id, userId: ownerId });
    res.json(project);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const inviteUser = async (req: Request, res: Response) => {
  const { projectId, userId } = req.body;

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    });

    if (project) {
      await ProjectUser.create({ projectId, userId });
      res.json({ message: 'User invited successfully' });
    } else {
      res.status(403).json({ error: 'Only the project owner can invite users' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const getProjectUsers = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    });

    if (project) {
      const userRoles = await UserRole.findAll({ where: { projectId }, include: User });
      res.json(userRoles.map(ur => ur.user));
    } else {
      res.status(403).json({ error: 'Only the project owner can view project users' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const addUserToProject = async (req: Request, res: Response) => {
  const { userId, roleId, projectId } = req.body;

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    });

    if (project) {
      const userRole = await UserRole.create({ userId, roleId, projectId });
      res.json(userRole);
    } else {
      res.status(403).json({ error: 'Only the project owner can add users to the project' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};


const removeUserFromProject = async (req: Request, res: Response) => {
  const { userId, projectId } = req.params;

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    });

    if (project) {
      const userRole = await UserRole.findOne({ where: { userId, projectId } });
      if (userRole) {
        await userRole.destroy();
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
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const project = await Project.findOne({
      where: {
        id: id,
        ownerId: req.session.user!.id
      }
    });

    if (project) {
      await project.update({ name, description });
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
  const { id } = req.params;

  try {
    const project = await Project.findOne({
      where: {
        id: id,
        ownerId: req.session.user!.id
      }
    });

    if (project) {
      await project.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ error: 'Only the project owner can delete the project' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

export { getProjects, createProject, inviteUser, getProjectUsers, addUserToProject, removeUserFromProject, updateProject, deleteProject };
