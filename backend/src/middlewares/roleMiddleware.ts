import { Request, Response, NextFunction } from 'express'
import { AppDataSource } from '../ormconfig'
import { Project } from '../models/Project'

const isProjectCreator = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.user?.id
  if (!userId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  const projectId = req.params.projectId || req.body.projectId
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' })
  }

  try {
    const projectRepository = AppDataSource.getRepository(Project)
    const project = await projectRepository.findOne({ where: { id: parseInt(projectId) } })

    if (project && project.ownerId === userId) {
      // Предполагая, что у вас есть связь ManyToOne для владельца проекта
      return next()
    } else {
      return res.status(403).json({ error: 'Only project creator can perform this action' })
    }
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error', stack: err.stack })
  }
}

export { isProjectCreator }
