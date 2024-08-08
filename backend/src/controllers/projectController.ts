import { Request, Response } from 'express'
import { Project, User } from '../models'
import { ProjectUser } from '../models'

const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!.id
    const projects = await Project.findAll({
      include: [
        {
          model: ProjectUser,
          where: { userId },
          attributes: [] // не включаем атрибуты из ProjectUser
        }
      ]
    })
    res.json(projects)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const getProject = async (req: Request, res: Response) => {
  const { projectId } = req.params

  try {
    const userId = req.session.user!.id

    const project = await Project.findOne({
      where: {
        id: projectId,
      },
      include: [
        {
          model: ProjectUser,
          where: { userId },
          attributes: [] // не включаем атрибуты из ProjectUser
        }
      ]
    })

    if (project) {
      res.json(project)
    } else {
      res.status(404).json({ error: 'Project not found or you do not have access' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const createProject = async (req: Request, res: Response) => {
  const { name, description } = req.body
  const ownerId = req.session.user!.id

  try {
    const project = await Project.create({ name, description, ownerId })
    await ProjectUser.create({ projectId: project.id, userId: ownerId })

    res.json(project)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const inviteUser = async (req: Request, res: Response) => {
  const { userId } = req.body
  const { projectId } = req.params

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    })

    const existingProjectUser = await ProjectUser.findOne({
      where: {
        projectId,
        userId
      }
    });

    if (existingProjectUser) {
      if (!existingProjectUser.active) {
        await existingProjectUser.update({
          active: true,
        })
        res.json({ message: 'User invited successfully' })
      }
      return res.status(400).json({ error: 'User is already a member of the project' });
    }

    if (project) {
      await ProjectUser.create({ projectId, userId })
      res.json({ message: 'User invited successfully' })
    } else {
      res.status(403).json({ error: 'Only the project owner can invite users' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const getProjectUsers = async (req: Request, res: Response) => {
  const { projectId } = req.params

  try {
    const project = await Project.findOne({
      include: [
        {
          model: ProjectUser,
          where: { userId: req.session.user!.id },
          attributes: [] // не включаем атрибуты из ProjectUser
        }
      ]
    })

    if (project) {
      const userRoles = await ProjectUser.findAll({ where: { projectId }, include: User });

      // Формируем объект с ключами по ID пользователя
      const usersById: Record<number, { id: number; username: string }> = {};
      userRoles.forEach((ur) => {
        if (ur.User) {
          usersById[ur.User.id] = {
            id: ur.User.id,
            username: ur.User.username
          };
        }
      });

      res.json(usersById);
    } else {
      res.status(403).json({ error: 'Only the project owner can view project users' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const DeActiveUser = async (req: Request, res: Response) => {
  const { userId, projectId } = req.params

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    })

    if (project) {
      const existingProjectUser = await ProjectUser.findOne({ where: { userId, projectId } })
      if (existingProjectUser) {
        await existingProjectUser.destroy()
        res.status(204).end()
      } else {
        res.status(404).json({ error: 'User not found in project' })
      }
    } else {
      res.status(403).json({ error: 'Only the project owner can remove users from the project' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const updateProject = async (req: Request, res: Response) => {
  const { projectId } = req.params
  const { name, description, customFields, savedFilters, priorities, statuses, tags, types } = req.body

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    })

    if (project) {
      await project.update({
        name: name ?? project.name,
        description: description ?? project.description,
        customFields: customFields ?? project.customFields,
        priorities: priorities ?? project.priorities,
        statuses: statuses ?? project.statuses,
        tags: tags ?? project.tags,
        types: tags ?? project.types,
        savedFilters: savedFilters ?? project.savedFilters,
      })
      res.json(project)
    } else {
      res.status(403).json({ error: 'Only the project owner can update the project' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const deleteProject = async (req: Request, res: Response) => {
  const { projectId } = req.params

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    })

    if (project) {
      await project.destroy()
      res.status(204).end()
    } else {
      res.status(403).json({ error: 'Only the project owner can delete the project' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

export {
  getProjects,
  getProject,
  createProject,
  inviteUser,
  getProjectUsers,
  DeActiveUser,
  updateProject,
  deleteProject
}
