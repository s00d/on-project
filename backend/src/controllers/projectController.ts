import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Path,
  Body,
  SuccessResponse,
  Request,
  Tags,
  Middlewares,
  Response,
  Security,
  Query
} from 'tsoa'
import { Project } from '../models/Project'
import { ProjectUser } from '../models/ProjectUser'
import { AppDataSource } from '../ormconfig'
import { User } from '../models/User'
import { authenticateAll } from '../middlewares/authMiddleware'
import { isProjectCreator } from '../middlewares/roleMiddleware'
import { Request as ExpressRequest } from 'express'
import { io } from '../index'

export interface Filter {
  name: string
  filters: {
    search: string
    status: string
    priority: string
    assignee: string[]
    tags: string[]
    groupBy: string
    pageSize: number
    visibleColumns: string[]
  }
}

@Route('api/projects')
@Tags('Projects')
@Security('session')
@Security('apiKey')
export class ProjectController extends Controller {
  @Get('/')
  @Middlewares(authenticateAll)
  public async getProjects(
    @Request() req: ExpressRequest,
    @Query() showArchived: boolean = false
  ): Promise<Project[]> {
    try {
      const userId = req.session.user!.id
      const projectRepository = AppDataSource.getRepository(Project)

      const queryBuilder = projectRepository
        .createQueryBuilder('project')
        .innerJoin('project.projectUsers', 'projectUser', 'projectUser.userId = :userId', {
          userId
        })

      if (showArchived) {
        queryBuilder.andWhere('project.isArchived = true')
      } else {
        queryBuilder.andWhere('project.isArchived = false')
      }

      return await queryBuilder.getMany()
    } catch (err: any) {
      throw new Error(`Error fetching projects: ${err.message}`)
    }
  }

  @Get('{projectId}')
  @Middlewares([authenticateAll])
  public async getProject(
    @Request() req: ExpressRequest,
    @Path() projectId: number
  ): Promise<Project> {
    try {
      const userId = req.session.user!.id
      const projectRepository = AppDataSource.getRepository(Project)

      const queryBuilder = projectRepository
        .createQueryBuilder('project')
        .innerJoin('project.projectUsers', 'projectUser', 'projectUser.userId = :userId', {
          userId
        })
        .leftJoinAndSelect('project.sprints', 'sprint')
        .where('project.id = :projectId', { projectId })

      const project = await queryBuilder.getOne()

      if (!project) {
        this.setStatus(404)
        throw new Error('Project not found or you do not have access')
      }

      return project
    } catch (err: any) {
      throw new Error(`Error fetching project: ${err.message}`)
    }
  }

  @Post('/')
  @Middlewares([authenticateAll])
  public async createProject(
    @Request() req: ExpressRequest,
    @Body() requestBody: { name: string; description?: string }
  ): Promise<Project> {
    try {
      const ownerId = req.session.user!.id
      const projectRepository = AppDataSource.getRepository(Project)
      const projectUserRepository = AppDataSource.getRepository(ProjectUser)

      const project = projectRepository.create({ ...requestBody, owner: { id: ownerId } })
      await projectRepository.save(project)

      const projectUser = projectUserRepository.create({ project, user: { id: ownerId } })
      await projectUserRepository.save(projectUser)

      return project
    } catch (err: any) {
      throw new Error(`Error creating project: ${err.message}`)
    }
  }

  @Put('{projectId}')
  @Middlewares([authenticateAll, isProjectCreator])
  public async updateProject(
    @Request() req: ExpressRequest,
    @Path() projectId: number,
    @Body()
    requestBody: {
      name?: string
      description?: string
      customFields?: { name: string; description: string; type: string }[]
      priorities?: string[]
      statuses?: string[]
      tags?: string[]
      types?: string[]
      savedFilters?: Filter[]
    }
  ): Promise<Project> {
    try {
      const ownerId = req.session.user!.id
      const projectRepository = AppDataSource.getRepository(Project)

      const project = await projectRepository.findOne({
        where: { id: projectId, owner: { id: ownerId } }
      })

      if (!project) {
        this.setStatus(403)
        throw new Error('Only the project owner can update the project')
      }

      Object.assign(project, requestBody)
      await projectRepository.save(project)

      return project
    } catch (err: any) {
      throw new Error(`Error updating project: ${err.message}`)
    }
  }

  @Delete('{projectId}')
  @Middlewares([authenticateAll, isProjectCreator])
  @SuccessResponse('204', 'Project successfully deleted')
  @Response('403', 'Only the project owner can delete the project')
  public async deleteProject(
    @Request() req: ExpressRequest,
    @Path() projectId: number
  ): Promise<void> {
    try {
      const ownerId = req.session.user!.id
      const projectRepository = AppDataSource.getRepository(Project)
      const projectUserRepository = AppDataSource.getRepository(ProjectUser)

      const project = await projectRepository.findOne({
        where: { id: projectId, owner: { id: ownerId } }
      })

      if (!project) {
        this.setStatus(403)
        throw new Error('Only the project owner can delete the project')
      }

      await projectUserRepository.delete({ project: { id: projectId } })
      await projectRepository.remove(project)
    } catch (err: any) {
      throw new Error(`Error deleting project: ${err.message}`)
    }
  }

  @Post('{projectId}/invite')
  @Middlewares([authenticateAll, isProjectCreator])
  public async inviteUser(
    @Request() req: ExpressRequest,
    @Path() projectId: number,
    @Body() requestBody: { userId?: number; email?: string; username?: string }
  ): Promise<{ message: string }> {
    try {
      const { userId, email, username } = requestBody
      const ownerId = req.session.user!.id
      const projectRepository = AppDataSource.getRepository(Project)
      const projectUserRepository = AppDataSource.getRepository(ProjectUser)
      const userRepository = AppDataSource.getRepository(User)

      const project = await projectRepository.findOne({
        where: { id: projectId, owner: { id: ownerId } }
      })

      if (!project) {
        this.setStatus(403)
        throw new Error('Only the project owner can invite users')
      }

      let user: User | null = null

      if (userId) {
        user = await userRepository.findOne({ where: { id: userId } })
      }
      if (!user && email) {
        user = await userRepository.findOne({ where: { email } })
      }
      if (!user && username) {
        user = await userRepository.findOne({ where: { username } })
      }

      if (!user) {
        this.setStatus(404)
        throw new Error('User not found')
      }

      const existingProjectUser = await projectUserRepository.findOne({
        where: { project: { id: projectId }, user: { id: user.id } }
      })

      if (existingProjectUser) {
        this.setStatus(400)
        throw new Error('User is already a member of the project')
      }

      const projectUser = projectUserRepository.create({ project, user })
      await projectUserRepository.save(projectUser)

      return { message: 'User invited successfully' }
    } catch (err: any) {
      throw new Error(`Error inviting user: ${err.message}`)
    }
  }

  @Get('{projectId}/users')
  @Middlewares([authenticateAll])
  public async getProjectUsers(
    @Path() projectId: number
  ): Promise<Record<number, { id: number; username: string }>> {
    try {
      const projectRepository = AppDataSource.getRepository(Project)
      const projectUserRepository = AppDataSource.getRepository(ProjectUser)

      const project = await projectRepository.findOne({
        where: { id: projectId },
        relations: ['owner', 'projectUsers', 'projectUsers.user']
      })

      if (!project) {
        this.setStatus(403)
        throw new Error('Only the project owner can view project users')
      }

      const userRoles = await projectUserRepository.find({
        where: { project: { id: projectId } },
        relations: ['user']
      })

      const usersById: Record<number, { id: number; username: string }> = {}
      userRoles.forEach((ur) => {
        if (ur.user) {
          usersById[ur.user.id] = {
            id: ur.user.id,
            username: ur.user.username
          }
        }
      })

      return usersById
    } catch (err: any) {
      throw new Error(`Error fetching project users: ${err.message}`)
    }
  }

  @Delete('{projectId}/users/{userId}')
  @Middlewares([authenticateAll, isProjectCreator])
  @SuccessResponse('204', 'User successfully deactivated')
  @Response('403', 'Only the project owner can remove users from the project')
  @Response('404', 'User not found in project')
  public async deActiveUser(
    @Request() req: ExpressRequest,
    @Path() projectId: number,
    @Path() userId: number
  ): Promise<void> {
    try {
      const currentUserId = req.session.user!.id
      const projectRepository = AppDataSource.getRepository(Project)
      const projectUserRepository = AppDataSource.getRepository(ProjectUser)

      if (currentUserId === userId) {
        this.setStatus(404)
        throw new Error('Self delete error')
      }

      const project = await projectRepository.findOne({
        where: { id: projectId, owner: { id: currentUserId } }
      })

      if (!project) {
        this.setStatus(403)
        throw new Error('Only the project owner can remove users from the project')
      }

      const existingProjectUser = await projectUserRepository.findOne({
        where: { user: { id: userId }, project: { id: projectId } }
      })

      if (!existingProjectUser) {
        this.setStatus(404)
        throw new Error('User not found in project')
      }

      await projectUserRepository.remove(existingProjectUser)
    } catch (err: any) {
      throw new Error(`Error deactivating user: ${err.message}`)
    }
  }

  @Put('{projectId}/archive')
  @Response(400, 'Bad request')
  @Response(404, 'Project not found')
  @SuccessResponse(200, 'Project archived successfully')
  @Middlewares([authenticateAll, isProjectCreator])
  public async archiveProject(@Path() projectId: number): Promise<Project> {
    try {
      const projectRepository = AppDataSource.getRepository(Project)
      const project = await projectRepository.findOne({ where: { id: projectId } })

      if (!project) {
        this.setStatus(404)
        throw new Error('Project not found')
      }

      project.isArchived = true
      await projectRepository.save(project)

      io.to(`project:${project.id}`).emit('project:archive', project)
      return project
    } catch (err: any) {
      this.setStatus(400)
      throw new Error(err.message)
    }
  }
}
