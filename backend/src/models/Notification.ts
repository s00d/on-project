/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - id
 *         - user
 *         - message
 *         - read
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the notification
 *           example: 1
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: The user associated with the notification
 *         message:
 *           type: string
 *           description: The message content of the notification
 *           example: "Your task has been updated."
 *         read:
 *           type: boolean
 *           description: The status of the notification (whether it has been read)
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the notification was created
 *           example: "2023-08-01T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the notification was last updated
 *           example: "2023-08-02T12:34:56Z"
 */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.notifications, { nullable: false })
  user!: User;

  @Column({ length: 255 })
  message!: string;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
