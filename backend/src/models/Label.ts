/**
 * @swagger
 * components:
 *   schemas:
 *     Label:
 *       type: object
 *       required:
 *         - id
 *         - project
 *         - user
 *         - name
 *         - color
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the label
 *           example: 1
 *         project:
 *           $ref: '#/components/schemas/Project'
 *           description: The project to which the label belongs
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: The user who created the label
 *         name:
 *           type: string
 *           description: The name of the label
 *           example: "Urgent"
 *         color:
 *           type: string
 *           description: The color code for the label
 *           example: "#FF5733"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the label was created
 *           example: "2023-08-01T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the label was last updated
 *           example: "2023-08-02T12:34:56Z"
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm'
import { Project } from './Project'
import { User } from './User'
import { Task } from './Task'

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Project, (project) => project.labels, { nullable: false })
  project!: Project

  @ManyToOne(() => User, (user) => user.labels, { nullable: false })
  user!: User

  @OneToMany(() => Task, (task) => task.label)
  tasks!: Task[]

  @Column({ length: 128 })
  @Index()
  name!: string

  @Column({ length: 7 })
  color!: string

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date
}
