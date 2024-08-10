/**
 * @swagger
 * components:
 *   schemas:
 *     TaskHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the task history record.
 *           example: 1
 *         task:
 *           $ref: '#/components/schemas/Task'
 *           description: The task to which this history record belongs.
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: The user who performed the action.
 *         action:
 *           type: string
 *           description: The action performed on the task.
 *           example: "status changed"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The date and time when the action was performed.
 *           example: "2023-08-09T12:34:56Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the task history record was created.
 *           example: "2023-08-09T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the task history record was last updated.
 *           example: "2023-08-09T12:34:56Z"
 */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity('task_histories')
export class TaskHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Task, task => task.history, { nullable: false })
  task!: Task;

  @ManyToOne(() => User, user => user.history, { nullable: false })
  user!: User;

  @Column({ length: 128 })
  action!: string;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
