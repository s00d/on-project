import { Controller, Get, Post, Query, Path, Body, Middlewares, Route, Tags, Security } from 'tsoa'
import { AppDataSource } from '../ormconfig'
import { Project } from '../models/Project'
import { Task } from '../models/Task'
import { authenticateAll } from '../middlewares/authMiddleware'

// Define response types
interface GenerateReportResponse {
  project: string
  description: string
  completedTasks: number
  totalTasks: number
  taskStatusDistribution: Record<string, number>
}

interface PriorityReportResponse {
  [key: string]: number
}

interface OverdueReportResponse {
  [key: string]: number
}

interface TeamPerformanceResponse {
  [key: string]: {
    total: number
    completed: number
  }
}

interface PriorityDistributionReportResponse {
  [key: string]: number
}

interface ProgressReportResponse {
  [key: string]: {
    total: number
    completed: number
  }
}

interface TeamWorkloadReportResponse {
  [key: string]: number
}

interface UniversalReportBody {
  model: string
  fields: string[]
  filters: Record<string, any>
  groupBy?: string
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  chartType?: string
  startDate?: string
  endDate?: string
}

interface UniversalReportResponse {
  chartType: string
  reportData: any[]
}

@Route('api/reports')
@Tags('Reports')
@Security('session')
@Security('apiKey')
export class ReportController extends Controller {
  @Get('/project/{projectId}')
  @Middlewares([authenticateAll])
  public async generateReport(
    @Path() projectId: number,
    @Query() startDate?: string,
    @Query() user: number | 'all' = 'all'
  ): Promise<GenerateReportResponse> {
    const projectRepository = AppDataSource.getRepository(Project)
    const queryBuilder = projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', { projectId })

    if (startDate) {
      queryBuilder.andWhere('task.updatedAt >= :startDate', { startDate: new Date(startDate) })
    }

    if (user !== 'all') {
      queryBuilder.andWhere('assignee.id = :userId', { userId: user })
    }

    const project = await queryBuilder.getOne()

    if (!project) {
      throw new Error('Project not found')
    }

    const tasks = project.tasks
    const completedTasks = tasks.filter((task) => task.status === 'Done').length
    const totalTasks = tasks.length

    const taskStatusDistribution = tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})

    return {
      project: project.name,
      description: project.description,
      completedTasks,
      totalTasks,
      taskStatusDistribution
    }
  }

  @Get('/project/{projectId}/priority_distribution')
  @Middlewares([authenticateAll])
  public async generatePriorityReport(
    @Path() projectId: number,
    @Query() user: string | 'all' = 'all',
    @Query() startDate?: string,
    @Query() type: 'bar' | 'pie' = 'bar'
  ): Promise<PriorityReportResponse> {
    const projectRepository = AppDataSource.getRepository(Project)

    // Проверяем существование проекта перед выполнением запроса
    const projectExists = await projectRepository.findOne({ where: { id: projectId } })
    if (!projectExists) {
      throw new Error('Project not found')
    }

    // Создаем запрос для задач проекта
    const queryBuilder = projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', { projectId })

    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate) })
    }

    if (user !== 'all') {
      queryBuilder.andWhere('assignee.id = :userId', { userId: user })
    }

    const project = await queryBuilder.getOne()

    // Если задач нет, возвращаем пустой объект
    if (!project || !project.tasks.length) {
      return {}
    }

    // Генерируем отчет
    return project.tasks.reduce((acc: Record<string, number>, task: Task) => {
      const key = type === 'bar' ? task.priority : task.status
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }

  @Get('/project/{projectId}/overdue')
  @Middlewares([authenticateAll])
  public async generateOverdueReport(
    @Path() projectId: number,
    @Query() startDate?: string
  ): Promise<OverdueReportResponse> {
    const projectRepository = AppDataSource.getRepository(Project)

    // Проверяем существование проекта
    const projectExists = await projectRepository.findOne({ where: { id: projectId } })
    if (!projectExists) {
      throw new Error('Project not found')
    }

    // Создаем запрос для задач
    const queryBuilder = projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .where('project.id = :projectId', { projectId })
      .andWhere('task.dueDate IS NOT NULL')
      .andWhere('task.dueDate < :now', { now: new Date() })
      .andWhere('task.status != :status', { status: 'Done' })

    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate) })
    }

    const project = await queryBuilder.getOne()

    // Если у проекта нет задач, возвращаем пустой объект
    if (!project || !project.tasks.length) {
      return {}
    }

    return project.tasks.reduce((acc: Record<string, number>, task: Task) => {
      const date = new Date(task.dueDate!).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
  }

  @Get('/project/{projectId}/performance')
  @Middlewares([authenticateAll])
  public async generateTeamPerformanceReport(
    @Path() projectId: number,
    @Query() startDate?: string
  ): Promise<TeamPerformanceResponse> {
    const projectRepository = AppDataSource.getRepository(Project)
    const queryBuilder = projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', { projectId })

    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate) })
    }

    const project = await queryBuilder.getOne()

    if (!project) {
      throw new Error('Project not found')
    }

    const teamPerformance: TeamPerformanceResponse = project.tasks.reduce(
      (acc: TeamPerformanceResponse, task: Task) => {
        task.assignees.forEach((assignee) => {
          const assigneeId = String(assignee.id)
          if (!acc[assigneeId]) {
            acc[assigneeId] = { total: 0, completed: 0 }
          }
          acc[assigneeId].total += 1
          if (task.status === 'Done') {
            acc[assigneeId].completed += 1
          }
        })
        return acc
      },
      {}
    )

    return teamPerformance
  }

  @Get('/project/{projectId}/progress')
  @Middlewares([authenticateAll])
  public async generateProgressReport(
    @Path() projectId: number,
    @Query() startDate?: string
  ): Promise<ProgressReportResponse> {
    const projectRepository = AppDataSource.getRepository(Project)
    const queryBuilder = projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .where('project.id = :projectId', { projectId })

    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate) })
    }

    const project = await queryBuilder.getOne()

    if (!project) {
      throw new Error('Project not found')
    }

    return project.tasks.reduce(
      (acc: Record<string, { total: number; completed: number }>, task: Task) => {
        const date = new Date(task.updatedAt).toLocaleDateString()
        acc[date] = acc[date] || { total: 0, completed: 0 }
        acc[date].total += 1
        if (task.status === 'Done') {
          acc[date].completed += 1
        }
        return acc
      },
      {}
    )
  }

  @Get('/project/{projectId}/workload')
  @Middlewares([authenticateAll])
  public async generateTeamWorkloadReport(
    @Path() projectId: number,
    @Query() startDate?: string
  ): Promise<TeamWorkloadReportResponse> {
    const projectRepository = AppDataSource.getRepository(Project)
    const queryBuilder = projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('project.id = :projectId', { projectId })

    if (startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', { startDate: new Date(startDate) })
    }

    const project = await queryBuilder.getOne()

    if (!project) {
      throw new Error('Project not found')
    }

    return project.tasks.reduce((acc: TeamWorkloadReportResponse, task: Task) => {
      task.assignees.forEach((assignee) => {
        const assigneeId = String(assignee.id) // Convert the assignee ID to a string
        acc[assigneeId] = (acc[assigneeId] || 0) + 1
      })
      return acc
    }, {})
  }

  @Post('/project/{projectId}/universal')
  @Middlewares([authenticateAll])
  public async generateUniversalReport(
    @Path() projectId: number,
    @Body() body: UniversalReportBody
  ): Promise<UniversalReportResponse> {
    const { model, fields, filters, groupBy, sortBy, sortOrder, chartType, startDate, endDate } =
      body

    const repo = AppDataSource.getRepository(model) // Assuming dynamic repository access

    let queryBuilder = repo.createQueryBuilder(model.toLowerCase())
    queryBuilder = queryBuilder.select(fields)

    Object.keys(filters).forEach((key) => {
      queryBuilder.andWhere(`${model.toLowerCase()}.${key} = :${key}`, { [key]: filters[key] })
    })

    if (startDate && endDate) {
      queryBuilder.andWhere(`${model.toLowerCase()}.createdAt BETWEEN :startDate AND :endDate`, {
        startDate,
        endDate
      })
    }

    if (groupBy) {
      queryBuilder.addGroupBy(`${model.toLowerCase()}.${groupBy}`)
    }

    if (sortBy) {
      queryBuilder.addOrderBy(`${model.toLowerCase()}.${sortBy}`, sortOrder)
    }

    const result = await queryBuilder.getRawMany()

    return {
      chartType: chartType || 'bar',
      reportData: result
    }
  }
}
