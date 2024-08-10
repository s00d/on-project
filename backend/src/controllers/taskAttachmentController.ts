import { Request, Response } from 'express'
import { AppDataSource } from '../ormconfig'
import { TaskAttachment } from '../models/TaskAttachment'

const getTaskAttachments = async (req: Request, res: Response) => {
  const { taskId } = req.params
  try {
    const attachmentRepository = AppDataSource.getRepository(TaskAttachment)
    const attachments = await attachmentRepository.find({
      where: { task: { id: parseInt(taskId) } }
    })
    res.json(attachments)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const addTaskAttachment = async (req: Request, res: Response) => {
  const { taskId } = req.params
  const file = req.file
  if (!file) {
    return res.status(400).json({ error: 'File not provided' })
  }
  try {
    const attachmentRepository = AppDataSource.getRepository(TaskAttachment)
    const attachment = attachmentRepository.create({
      task: { id: parseInt(taskId) },
      filename: file.originalname,
      filePath: file.path
    })
    await attachmentRepository.save(attachment)
    res.json(attachment)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const deleteTaskAttachment = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const attachmentRepository = AppDataSource.getRepository(TaskAttachment)
    const attachment = await attachmentRepository.findOne({ where: { id: parseInt(id) } })
    if (attachment) {
      await attachmentRepository.remove(attachment)
      res.status(204).end()
    } else {
      res.status(404).json({ error: 'Attachment not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

export { getTaskAttachments, addTaskAttachment, deleteTaskAttachment }
