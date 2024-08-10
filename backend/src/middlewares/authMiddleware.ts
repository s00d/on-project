import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { AppDataSource } from '../ormconfig'
import { Project } from '../models/Project'

const authenticateJWT = async (req: Request): Promise<any> => {
  const token = req.header('Authorization')?.split(' ')[1]

  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET as string)
    } catch (err) {
      throw new Error('Invalid token')
    }
  }
  throw new Error('No token provided')
}

const authenticateSession = async (req: Request): Promise<any> => {
  if (req.session && req.session.user) {
    return req.session.user
  }
  throw new Error('No session found')
}

const authenticateTokenInDB = async (req: Request): Promise<any> => {
  const apikey = req.header('Authorization')?.split(' ')[1]

  if (apikey) {
    try {
      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { apikey } })

      if (!user) {
        throw new Error('User not found in DB')
      }

      return user
    } catch (err) {
      throw new Error('Invalid token')
    }
  }
  throw new Error('No token provided')
}

const checkProject = async (req: Request, userId: number): Promise<any> => {
  const { projectId } = req.params
  if (projectId) {
    const projectRepository = AppDataSource.getRepository(Project)
    try {
      const project = await projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.projectUsers', 'projectUser') // Это выбирает projectUser
        .where('project.id = :projectId', { projectId })
        .andWhere('(project.ownerId = :userId OR projectUser.userId = :userId)', { userId })
        .getOne()

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

      throw new Error('You do not have access to this project.')
    } catch (error) {
      console.error('Error fetching project:', error)
      throw new Error('Internal Server Error')
    }
  }

  return null
}

const authenticateAll = async (req: Request, res: Response, next: NextFunction) => {
  const err = null
  try {
    req.session.user = await authenticateSession(req)
    req.session.project = await checkProject(req, req.session.user!.id)
    return next()
  } catch (err) {
    // Ignore error and try next method
  }

  try {
    req.session.user = await authenticateJWT(req)
    req.session.project = await checkProject(req, req.session.user!.id)
    return next()
  } catch (err) {
    // Ignore error and try next method
  }

  try {
    req.session.user = await authenticateTokenInDB(req)
    req.session.project = await checkProject(req, req.session.user!.id)
    return next()
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}

export { authenticateAll }
