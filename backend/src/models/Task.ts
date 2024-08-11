import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  JoinColumn,
  RelationId
} from 'typeorm'
import { Project } from './Project'
import { Label } from './Label'
import { Comment } from './Comment'
import { TaskAttachment } from './TaskAttachment'
import { TaskHistory } from './TaskHistory'
import { ProjectUser } from './ProjectUser'
import { Sprint } from './Sprint'
import { User } from './User'

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 128 })
  @Index()
  title!: string

  @Column('text', { default: '' })
  @Index()
  description!: string

  @Column({ length: 128, default: '' })
  @Index()
  status!: string

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: false })
  project!: Project

  @ManyToOne(() => Label, (label) => label.tasks, { nullable: true })
  @JoinColumn({ name: 'labelId' })
  label!: Label|null

  @RelationId((task: Task) => task.label)
  labelId?: number|null

  @Column('datetime', { nullable: true })
  @Index()
  startDate!: Date | null

  @Column('datetime', { nullable: true })
  @Index()
  stopDate!: Date | null

  @Column('date', { nullable: true })
  @Index()
  dueDate!: Date | null

  @Column({ length: 128, default: 'Medium' })
  priority!: string

  @Column('int', { default: 0 })
  estimatedTime!: number

  @Column('int', { default: 0 })
  actualTime!: number

  @ManyToMany(() => ProjectUser, (projectUser) => projectUser.tasks)
  @JoinTable()
  assignees!: ProjectUser[]

  @Column({ length: 128, default: '' })
  @Index()
  type!: string

  @Column('date', { nullable: true })
  plannedDate!: Date|null

  @ManyToOne(() => Task, (task) => task.relatedTasks, { nullable: true })
  @JoinColumn({ name: 'relatedTaskId' })
  relatedTask!: Task|null

  @RelationId((task: Task) => task.relatedTask)
  relatedTaskId?: number|null

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: true })
  relatedTasks!: Task[]

  @ManyToOne(() => Task, (task) => task.sprint, { nullable: true })
  @JoinColumn({ name: 'sprintId' })
  sprint!: Sprint | null

  @RelationId((task: Task) => task.sprint)
  sprintId?: number | null

  @Column('simple-array', { nullable: true })
  @Index()
  tags!: string[]

  @Column('simple-json', { nullable: true })
  customFields!: null|{ [name: string]: string }


  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Comment[]

  @OneToMany(() => TaskAttachment, (attachment) => attachment.task)
  attachments!: TaskAttachment[]

  @OneToMany(() => TaskHistory, (history) => history.task)
  history!: TaskHistory[]

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
}
