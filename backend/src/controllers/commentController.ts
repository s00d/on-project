import { Request, Response } from 'express'
import { Comment } from '../models/Comment'
import { User } from '../models/User'
import { AppDataSource } from '../ormconfig'
import { io } from '../index'
import path from 'path'
import fs from 'fs'
import formidable from 'formidable'
import { Task } from '../models/Task'

const getComments = async (req: Request, res: Response) => {
  const taskId = req.params.taskId
  const commentRepository = AppDataSource.getRepository(Comment)
  const comments = await commentRepository.find({
    where: { task: { id: parseInt(taskId) } },
    relations: ['user']
  })
  res.json(comments)
}

const addComment = async (req: Request, res: Response) => {
  const taskId = req.params.id
  const form = formidable({})

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }

    const content = fields?.content?.toString()
    const userId = parseInt(fields?.userId?.toString() ?? '0')

    const file = files?.attachment as File | undefined

    let savedFilename = null

    if (file) {
      const uploadDir = path.join(__dirname, '../../uploads') // путь к директории для загрузки файлов

      const filename = `${Date.now()}_${file.name}`
      const filepath = path.join(uploadDir, filename)

      // Перемещение файла из временной директории в желаемую
      try {
        // @ts-ignore
        fs.renameSync(file.path, filepath)
      } catch (err) {
        return res.status(500).json({ error: 'File upload failed' })
      }

      savedFilename = filename
    }

    try {
      const commentRepository = AppDataSource.getRepository(Comment)
      const userRepository = AppDataSource.getRepository(User)
      const taskRepository = AppDataSource.getRepository(Task)

      const user = await userRepository.findOne({ where: { id: userId } })
      const task = await taskRepository.findOne({ where: { id: parseInt(taskId) } })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      if (!task) {
        return res.status(404).json({ error: 'Task not found' })
      }

      const comment = commentRepository.create({
        content,
        task,
        user,
        attachment: savedFilename
      })

      await commentRepository.save(comment)
      io.emit('comment:create', comment)
      res.json(comment)
    } catch (err: any) {
      const error = err as Error
      res.status(400).json({ error: error.message })
    }
  })
}

const updateComment = async (req: Request, res: Response) => {
  const { id } = req.params
  const { content } = req.body

  try {
    const commentRepository = AppDataSource.getRepository(Comment)
    const comment = await commentRepository.findOne({ where: { id: parseInt(id) } })

    if (comment) {
      comment.content = content
      await commentRepository.save(comment)
      io.emit('comment:update', comment)
      res.json(comment)
    } else {
      res.status(404).json({ error: 'Comment not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const commentRepository = AppDataSource.getRepository(Comment)
    const comment = await commentRepository.findOne({ where: { id: parseInt(id) } })

    if (comment) {
      if (comment.attachment) {
        fs.unlinkSync(path.join(__dirname, '../../uploads', comment.attachment))
      }
      await commentRepository.remove(comment)
      io.emit('comment:delete', { id: Number(id) })
      res.status(204).end()
    } else {
      res.status(404).json({ error: 'Comment not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

export { getComments, addComment, updateComment, deleteComment }
