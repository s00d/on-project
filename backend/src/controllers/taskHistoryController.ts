import {
  Controller,
  Get,
  Delete,
  Route,
  Tags,
  Path,
  Response,
  SuccessResponse,
  Security,
  Middlewares
} from 'tsoa'
import { AppDataSource } from '../ormconfig'
import { TaskHistory } from '../models/TaskHistory'
import { Task } from '../models/Task'
import { In } from 'typeorm'
import { authenticateAll } from '../middlewares/authMiddleware'
import { isProjectCreator } from '../middlewares/roleMiddleware'

@Route('api/task-history')
@Tags('Task History')
@Security('session')
@Security('apiKey')
export class TaskHistoryController extends Controller {
  /**
   * @summary Get task history
   * @param taskId - ID of the task
   */
  @Get('{projectId}/{taskId}')
  @Response(404, 'Task not found')
  @Response(400, 'Bad request')
  @SuccessResponse(200, 'List of task history entries')
  @Middlewares([authenticateAll])
  public async getTaskHistory(@Path() taskId: number): Promise<TaskHistory[]> {
    try {
      const taskHistoryRepository = AppDataSource.getRepository(TaskHistory)
      const history = await taskHistoryRepository.find({
        where: { task: { id: taskId } },
        relations: ['task', 'user']
      })
      if (!history.length) {
        this.setStatus(404)
        throw new Error('Task history not found')
      }
      return history
    } catch (err: any) {
      this.setStatus(400)
      throw new Error(`Error getting task history: ${err.message}`)
    }
  }

  /**
   * @summary Clear history for a specific task
   * @param taskId - ID of the task
   */
  @Delete('{projectId}/{taskId}')
  @Response(404, 'Task not found')
  @Response(400, 'Bad request')
  @SuccessResponse(204, 'Task history cleared successfully')
  @Middlewares([authenticateAll, isProjectCreator])
  public async clearTaskHistoryByTask(@Path() taskId: number): Promise<void> {
    try {
      const taskHistoryRepository = AppDataSource.getRepository(TaskHistory)
      await taskHistoryRepository.delete({ task: { id: taskId } })
      this.setStatus(204)
    } catch (err: any) {
      this.setStatus(400)
      throw new Error(`Error clearing task history: ${err.message}`)
    }
  }

  /**
   * @summary Clear history for all tasks in a project
   * @param projectId - ID of the project
   */
  @Delete('{projectId}')
  @Response(404, 'Project or tasks not found')
  @Response(400, 'Bad request')
  @SuccessResponse(204, 'Project task history cleared successfully')
  @Middlewares([authenticateAll, isProjectCreator])
  public async clearTaskHistoryByProject(@Path() projectId: number): Promise<void> {
    try {
      const taskHistoryRepository = AppDataSource.getRepository(TaskHistory)
      const taskRepository = AppDataSource.getRepository(Task)
      const tasks = await taskRepository.find({
        where: { project: { id: projectId } }
      })

      if (tasks.length > 0) {
        const taskIds = tasks.map((task) => task.id)
        const result = await taskHistoryRepository.delete({ task: { id: In(taskIds) } })
        if (result.affected === 0) {
          this.setStatus(404)
          throw new Error('No task history found for the project')
        }
        this.setStatus(204)
      } else {
        this.setStatus(404)
        throw new Error('Project or tasks not found')
      }
    } catch (err: any) {
      this.setStatus(400)
      throw new Error(`Error clearing task history by project: ${err.message}`)
    }
  }
}

export const logTaskHistory = async (
  taskId: number,
  userId: number,
  action: string,
  changes: Record<string, any>
) => {
  try {
    const taskHistoryRepository = AppDataSource.getRepository(TaskHistory)

    // Преобразуем значения, если они являются объектами
    const processedChanges = Object.keys(changes).reduce(
      (acc, field) => {
        acc[field] = {
          oldValue:
            typeof changes[field].oldValue === 'object'
              ? JSON.stringify(changes[field].oldValue)
              : changes[field].oldValue,
          newValue:
            typeof changes[field].newValue === 'object'
              ? JSON.stringify(changes[field].newValue)
              : changes[field].newValue
        }
        return acc
      },
      {} as Record<string, { oldValue: any; newValue: any }>
    )

    if (Object.keys(processedChanges).length === 0) {
      return // Если изменений нет, то выходим из функции
    }

    // Создаем одну запись в истории изменений
    const historyEntry = taskHistoryRepository.create({
      task: { id: taskId },
      user: { id: userId },
      action,
      changes: processedChanges
    })

    return await taskHistoryRepository.save(historyEntry)
  } catch (err) {
    console.error('Failed to log task history', err)
  }
}
