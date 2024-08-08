import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { AppDataSource } from '../ormconfig';
import { io } from '../index';
import { sendEmail } from '../services/emailService';

const getNotifications = async (req: Request, res: Response) => {
  const userId = req.session.user!.id;
  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const notifications = await notificationRepository.find({ where: { user: { id: userId } } });
    res.json(notifications);
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const notification = await notificationRepository.findOne({ where: { id: parseInt(id) } });

    if (notification) {
      notification.read = true;
      await notificationRepository.save(notification);
      io.emit('notification:read', notification);
      res.json(notification);
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (err: any) {
    const error = err as Error;
    res.status(400).json({ error: error.message });
  }
};

const createNotification = async (userId: number, message: string) => {
  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const notification = notificationRepository.create({
      user: user,
      message: message,
      read: false
    });

    await notificationRepository.save(notification);
    io.emit('notification:create', notification);

    if (user.email) {
      await sendEmail(user.email, 'New Notification', message);
    }

    return notification;
  } catch (err: any) {
    console.error('Failed to create notification', err);
  }
};

export { getNotifications, markAsRead, createNotification };
