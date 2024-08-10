/**
 * @swagger
 * components:
 *   schemas:
 *     TaskTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the task template.
 *           example: 1
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: The user who created the task template.
 *         title:
 *           type: string
 *           description: The title of the task template.
 *           example: "Bug Report Template"
 *         description:
 *           type: string
 *           nullable: true
 *           description: A detailed description of the task template.
 *           example: "This template is used for reporting bugs."
 *         priority:
 *           type: string
 *           description: The priority level of the task template.
 *           example: "High"
 *         status:
 *           type: string
 *           description: The default status of tasks created from this template.
 *           example: "To Do"
 *         tag:
 *           type: string
 *           description: The default tag associated with tasks created from this template.
 *           example: "bug"
 *         type:
 *           type: string
 *           description: The type of task this template represents.
 *           example: "Bug"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the task template was created.
 *           example: "2023-08-09T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the task template was last updated.
 *           example: "2023-08-09T12:34:56Z"
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from './User'

@Entity('task_templates')
export class TaskTemplate {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.taskTemplates, { nullable: false })
  user!: User

  @Column()
  title!: string

  @Column('text', { nullable: true })
  description!: string

  @Column({ default: 'Medium' })
  priority!: string

  @Column({ default: '' })
  status!: string

  @Column({ default: '' })
  tag!: string

  @Column({ default: '' })
  type!: string

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date
}
