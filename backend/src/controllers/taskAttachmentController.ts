import { Request, Response } from 'express'
import { TaskAttachment } from '../models'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({ storage })

const getTaskAttachments = async (req: Request, res: Response) => {
  const { taskId } = req.params
  try {
    const attachments = await TaskAttachment.findAll({ where: { taskId } })
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
    const attachment = await TaskAttachment.create({
      taskId: Number(taskId),
      filename: file.originalname,
      filePath: file.path
    })
    res.json(attachment)
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const deleteTaskAttachment = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const attachment = await TaskAttachment.findByPk(id)
    if (attachment) {
      await attachment.destroy()
      res.status(204).end()
    } else {
      res.status(404).json({ error: 'Attachment not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

export { getTaskAttachments, addTaskAttachment, deleteTaskAttachment, upload }
