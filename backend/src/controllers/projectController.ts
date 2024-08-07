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
        ownerId: userId
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
  const { projectId, userId } = req.body

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    })

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
      const userRoles = await ProjectUser.findAll({ where: { projectId }, include: User })
      res.json(userRoles.map((ur) => ({ id: ur.User?.id, username: ur.User?.username })))
    } else {
      res.status(403).json({ error: 'Only the project owner can view project users' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const addUserToProject = async (req: Request, res: Response) => {
  const { userId, projectId } = req.body

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    })

    if (project) {
      const userRole = await ProjectUser.create({ userId, projectId })
      res.json(userRole)
    } else {
      res.status(403).json({ error: 'Only the project owner can add users to the project' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const removeUserFromProject = async (req: Request, res: Response) => {
  const { userId, projectId } = req.params

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    })

    if (project) {
      const userRole = await ProjectUser.findOne({ where: { userId, projectId } })
      if (userRole) {
        await userRole.destroy()
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
  const { name, description } = req.body

  try {
    const project = await Project.findOne({
      where: {
        id: projectId,
        ownerId: req.session.user!.id
      }
    })

    if (project) {
      await project.update({ name, description })
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
  addUserToProject,
  removeUserFromProject,
  updateProject,
  deleteProject
}
