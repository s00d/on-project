/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the user.
 *           example: 1
 *         apikey:
 *           type: string
 *           description: The API key associated with the user.
 *           example: "123456789abcdef"
 *         username:
 *           type: string
 *           description: The unique username of the user.
 *           example: "johndoe"
 *         email:
 *           type: string
 *           description: The unique email address of the user.
 *           example: "johndoe@example.com"
 *         password:
 *           type: string
 *           description: The hashed password of the user (excluded from responses).
 *           example: "$2b$10$EixZaYVK1fsbw1Zfbx3OXePaW.ybYKCJgkdUqYPt8bGkRp8xKZzqi"
 *         twoFactorEnabled:
 *           type: boolean
 *           description: Flag indicating whether two-factor authentication is enabled.
 *           example: true
 *         twoFactorSecret:
 *           type: string
 *           description: The secret key for two-factor authentication (excluded from responses).
 *           example: "JBSWY3DPEHPK3PXP"
 *         resetPasswordToken:
 *           type: string
 *           description: The token used for password reset requests (excluded from responses).
 *           example: "abcd1234efgh5678"
 *         resetPasswordExpires:
 *           type: string
 *           format: date-time
 *           description: The expiration time for the password reset token (excluded from responses).
 *           example: "2023-08-09T12:34:56Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was created.
 *           example: "2023-08-09T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the user was last updated.
 *           example: "2023-08-09T12:34:56Z"
 *         projects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Project'
 *           description: The projects owned by the user.
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *           description: The notifications received by the user.
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *           description: The comments made by the user.
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *           description: The tasks assigned to the user.
 *         projectUsers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectUser'
 *           description: The projects the user is part of.
 *         history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskHistory'
 *           description: The task history actions performed by the user.
 *         taskTemplates:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskTemplate'
 *           description: The task templates created by the user.
 *         labels:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Label'
 *           description: The labels created by the user.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  UpdateDateColumn,
  CreateDateColumn,
  Index
} from 'typeorm'
import { Project } from './Project'
import { Notification } from './Notification'
import { Comment } from './Comment'
import { Task } from './Task'
import { ProjectUser } from './ProjectUser'
import { TaskHistory } from './TaskHistory'
import { TaskTemplate } from './TaskTemplate'
import { Label } from './Label'
import { Exclude } from 'class-transformer'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ unique: true, nullable: true })
  @Index()
  apikey!: string

  @Column({ unique: true })
  @Index()
  username!: string

  @Column({ unique: true })
  @Index()
  email!: string

  @Column()
  @Exclude()
  password!: string

  @Column({ default: false })
  @Index()
  twoFactorEnabled!: boolean

  @Column({ type: 'text', nullable: true })
  @Exclude()
  twoFactorSecret!: string | null

  @Column({ type: 'text', nullable: true })
  @Exclude()
  resetPasswordToken!: string | null

  @Column({ type: 'datetime', nullable: true })
  @Exclude()
  resetPasswordExpires!: Date | null

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Index()
  updatedAt!: Date

  @OneToMany(() => Project, (project) => project.owner)
  projects!: Project[]

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[]

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[]

  @ManyToMany(() => Task, (task) => task.assignees)
  tasks!: Task[]

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.user)
  projectUsers!: ProjectUser[]

  @OneToMany(() => TaskHistory, (history) => history.user)
  history!: TaskHistory[]

  @OneToMany(() => TaskTemplate, (taskTemplate) => taskTemplate.user)
  taskTemplates!: TaskTemplate[]

  @OneToMany(() => Label, (label) => label.user)
  labels!: Label[]
}
