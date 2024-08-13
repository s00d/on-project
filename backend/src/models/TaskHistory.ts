import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from './User'
import { Task } from './Task'
import { Example } from 'tsoa'

@Entity('task_histories')
export class TaskHistory {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number

  @ManyToOne(() => Task, (task) => task.history, { nullable: false })
  @Example(1)
  task!: Task

  @ManyToOne(() => User, (user) => user.history, { nullable: false })
  @Example(1)
  user!: User

  @Column({ length: 128 })
  @Example('Status Change')
  action!: string

  @Column('json', { nullable: true })
  @Example({ status: { oldValue: 'To Do', newValue: 'In Progress' } })
  changes!: Record<string, { oldValue: any; newValue: any }> // JSON-объект, содержащий изменения

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Example('2024-08-11T12:00:00Z')
  timestamp!: Date

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Example('2024-08-11T00:00:00Z')
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Example('2024-08-11T12:00:00Z')
  updatedAt!: Date
}
