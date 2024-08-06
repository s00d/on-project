import { Request, Response } from 'express'
import { Notification, User } from '../models'
import { io } from '../index'
import { sendEmail } from '../services/emailService'

const getNotifications = async (req: Request, res: Response) => {
  const userId = req.session.user!.id
  const notifications = await Notification.findAll({ where: { userId } })
  res.json(notifications)
}

const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const notification = await Notification.findByPk(id)
    if (notification) {
      await notification.update({ read: true })
      io.emit('notification:read', notification)
      res.json(notification)
    } else {
      res.status(404).json({ error: 'Notification not found' })
    }
  } catch (err: any) {
    const error = err as Error
    res.status(400).json({ error: error.message })
  }
}

const createNotification = async (userId: number, message: string) => {
  try {
    const notification = await Notification.create({ userId, message })
    io.emit('notification:create', notification)

    const user = await User.findByPk(userId)
    if (user && user.email) {
      await sendEmail(user.email, 'New Notification', message)
    }

    return notification
  } catch (err) {
    console.error('Failed to create notification', err)
  }
}

export { getNotifications, markAsRead, createNotification }
