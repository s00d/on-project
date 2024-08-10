/**
 * @swagger
 * components:
 *   schemas:
 *     TaskAttachment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the task attachment.
 *           example: 1
 *         task:
 *           $ref: '#/components/schemas/Task'
 *           description: The task to which this attachment belongs.
 *         filename:
 *           type: string
 *           description: The original name of the file as uploaded.
 *           example: "design_mockup_v2.png"
 *         filePath:
 *           type: string
 *           description: The path to the file in the file system or cloud storage.
 *           example: "/uploads/design_mockup_v2.png"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the attachment was created.
 *           example: "2023-08-01T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the attachment was last updated.
 *           example: "2023-08-02T12:34:56Z"
 */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Task } from './Task';

@Entity('task_attachments')
export class TaskAttachment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Task, task => task.attachments, { nullable: false })
  task!: Task;

  @Column({ length: 128 })
  filename!: string;

  @Column({ length: 255 })
  filePath!: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
