import {
  Controller,
  Get,
  Put,
  Route,
  Path,
  Response,
  SuccessResponse,
  Request,
  Middlewares,
  Security,
  Tags
} from 'tsoa';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { AppDataSource } from '../ormconfig';
import { io } from '../index';
import { sendEmail } from '../services/emailService';
import {Request as ExpressRequest} from "express";
import {authenticateAll} from "../middlewares/authMiddleware";

@Route('api/notifications')
@Tags('Notifications')
@Security('session')
@Security('apiKey')
export class NotificationController extends Controller {

  @Get('/')
  @Middlewares([
    authenticateAll,
  ])
  public async getNotifications(@Request() req: ExpressRequest,): Promise<Notification[]> {
    try {
      const userId = req.session.user!.id
      const notificationRepository = AppDataSource.getRepository(Notification);
      return await notificationRepository.find({ where: { user: { id: userId } } });
    } catch (err: any) {
      throw new Error(`Error fetching notifications: ${err.message}`);
    }
  }

  @Put('{id}/read')
  @Middlewares([
    authenticateAll
  ])
  @SuccessResponse('200', 'Notification marked as read')
  @Response('404', 'Notification not found')
  public async markAsRead(
    @Path() id: number,
    @Request() req: ExpressRequest,
  ): Promise<Notification> {
    const userId = req.session.user!.id;
    try {
      const notificationRepository = AppDataSource.getRepository(Notification);
      const notification = await notificationRepository.findOne({ where: { id, user: { id: userId } } });
      if (!notification) {
        this.setStatus(404);
        throw new Error('Notification not found');
      }

      notification.read = true;
      await notificationRepository.save(notification);
      io.to(`user:${userId}`).emit('notification:read', notification);
      return notification;
    } catch (err: any) {
      throw new Error(`Error marking notification as read: ${err.message}`);
    }
  }
}

export const createNotification = async (userId: number, message: string) => {
  try {
    const notificationRepository = AppDataSource.getRepository(Notification)
    const userRepository = AppDataSource.getRepository(User)

    const user = await userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new Error('User not found')
    }

    const notification = notificationRepository.create({
      user: user,
      message: message,
      read: false
    })

    await notificationRepository.save(notification)
    io.to(`user:${user.id}`).emit('notification:create', notification)

    if (user.email) {
      await sendEmail(user.email, 'New Notification', message)
    }

    return notification
  } catch (err: any) {
    console.error('Failed to create notification', err)
  }
}
