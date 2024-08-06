import { Request, Response } from 'express'
import { TaskHistory } from '../models'

const getTaskHistory = async (req: Request, res: Response) => {
  const { taskId } = req.params
  try {
    const history = await TaskHistory.findAll({ where: { taskId } })
    res.json(history)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const logTaskHistory = async (taskId: number, userId: number, action: string) => {
  try {
    return await TaskHistory.create({ taskId, userId, action })
  } catch (err) {
    console.error('Failed to log task history', err)
  }
}

export { getTaskHistory, logTaskHistory }
