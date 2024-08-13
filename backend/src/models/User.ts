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
import { Hidden } from 'tsoa'
import { Example } from 'tsoa'
import { Document } from './Document'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number

  @Column({ unique: true, nullable: true })
  @Index()
  @Example('api-key-12345')
  apikey!: string

  @Column({ unique: true })
  @Index()
  @Example('johndoe')
  username!: string

  @Column({ unique: true })
  @Index()
  @Example('johndoe@example.com')
  email!: string

  @Column()
  @Exclude()
  @Hidden()
  password!: string

  @Column({ default: false })
  @Index()
  @Example(false)
  twoFactorEnabled!: boolean

  @Column({ type: 'text', nullable: true })
  @Exclude()
  @Hidden()
  @Example(null)
  twoFactorSecret!: string | null

  @Column({ type: 'text', nullable: true })
  @Exclude()
  @Hidden()
  @Example(null)
  resetPasswordToken!: string | null

  @Column({ type: 'datetime', nullable: true })
  @Exclude()
  @Hidden()
  @Example(null)
  resetPasswordExpires!: Date | null

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  @Example('2024-08-11T00:00:00Z')
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Index()
  @Example('2024-08-11T00:00:00Z')
  updatedAt!: Date

  @OneToMany(() => Project, (project) => project.owner)
  @Example([{ id: 1, name: 'Project 1' }])
  projects!: Project[]

  @OneToMany(() => Notification, (notification) => notification.user)
  @Example([{ id: 1, message: 'Notification 1', read: false }])
  notifications!: Notification[]

  @OneToMany(() => Comment, (comment) => comment.user)
  @Example([{ id: 1, content: 'This is a comment.' }])
  comments!: Comment[]

  @ManyToMany(() => Task, (task) => task.assignees)
  @Example([{ id: 1, title: 'Task 1' }])
  tasks!: Task[]

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.user)
  @Example([{ id: 1, projectId: 1 }])
  projectUsers!: ProjectUser[]

  @OneToMany(() => TaskHistory, (history) => history.user)
  @Example([{ id: 1, action: 'Task Created' }])
  history!: TaskHistory[]

  @OneToMany(() => TaskTemplate, (taskTemplate) => taskTemplate.user)
  @Example([{ id: 1, title: 'Template 1' }])
  taskTemplates!: TaskTemplate[]

  @OneToMany(() => Label, (label) => label.user)
  @Example([{ id: 1, name: 'Bug' }])
  labels!: Label[]

  @OneToMany(() => Document, (document) => document.user)
  @Example([{ id: 1, title: 'Document 1' }])
  documents!: Document[]
}
