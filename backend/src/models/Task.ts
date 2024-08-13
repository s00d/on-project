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
  RelationId,
  Generated,
  BeforeInsert
} from 'typeorm'
import { Project } from './Project'
import { Label } from './Label'
import { Comment } from './Comment'
import { TaskAttachment } from './TaskAttachment'
import { TaskHistory } from './TaskHistory'
import { ProjectUser } from './ProjectUser'
import { Sprint } from './Sprint'
import { Example } from 'tsoa'
import { AppDataSource } from '../ormconfig'

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number

  @Column('int', { default: 0 })
  @Index()
  order!: number

  @Column({ length: 128 })
  @Index()
  @Example('Implement authentication')
  title!: string

  @Column('text', { default: '' })
  @Index()
  @Example('This task involves setting up user authentication.')
  description!: string

  @Column({ length: 128, default: '' })
  @Index()
  @Example('In Progress')
  status!: string

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: false })
  @Example(1)
  project!: Project

  @ManyToOne(() => Label, (label) => label.tasks, { nullable: true })
  @JoinColumn({ name: 'labelId' })
  @Example(1)
  label!: Label | null

  @RelationId((task: Task) => task.label)
  @Example(1)
  labelId?: number | null

  @Column('datetime', { nullable: true })
  @Index()
  @Example('2024-08-11T08:00:00Z')
  startDate!: Date | null

  @Column('datetime', { nullable: true })
  @Index()
  @Example('2024-08-11T17:00:00Z')
  stopDate!: Date | null

  @Column('date', { nullable: true })
  @Index()
  @Example('2024-08-15')
  dueDate!: Date | null

  @Column({ length: 128, default: 'Medium' })
  @Example('High')
  priority!: string

  @Column('int', { default: 0 })
  @Example(8)
  estimatedTime!: number

  @Column('int', { default: 0 })
  @Example(6)
  actualTime!: number

  @ManyToMany(() => ProjectUser, (projectUser) => projectUser.tasks)
  @JoinTable()
  @Example([1, 2])
  assignees!: ProjectUser[]

  @Column({ length: 128, default: '' })
  @Index()
  @Example('Bug')
  type!: string

  @Column('date', { nullable: true })
  @Example('2024-08-14')
  plannedDate!: Date | null

  @ManyToOne(() => Task, (task) => task.relatedTasks, { nullable: true })
  @JoinColumn({ name: 'relatedTaskId' })
  @Example(2)
  relatedTask!: Task | null

  @RelationId((task: Task) => task.relatedTask)
  @Example(2)
  relatedTaskId?: number | null

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: true })
  relatedTasks!: Task[]

  @ManyToOne(() => Task, (task) => task.sprint, { nullable: true })
  @JoinColumn({ name: 'sprintId' })
  @Example(1)
  sprint!: Sprint | null

  @RelationId((task: Task) => task.sprint)
  @Example(1)
  sprintId?: number | null

  @Column('simple-array', { nullable: true })
  @Index()
  @Example(['frontend', 'backend'])
  tags!: string[]

  @Column('simple-json', { nullable: true })
  @Example({ customField1: 'value1', customField2: 'value2' })
  customFields!: null | { [name: string]: string }

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Comment[]

  @OneToMany(() => TaskAttachment, (attachment) => attachment.task)
  attachments!: TaskAttachment[]

  @OneToMany(() => TaskHistory, (history) => history.task)
  history!: TaskHistory[]

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

  @BeforeInsert()
  async setOrder() {
    const taskRepository = AppDataSource.getRepository(Task)

    // Получаем максимальное значение order среди всех задач
    const maxOrderTask = await taskRepository
      .createQueryBuilder('task')
      .select('MAX(task.order)', 'max')
      .getRawOne()

    // Устанавливаем значение order для новой задачи
    this.order = (maxOrderTask?.max ?? 0) + 1
  }
}
