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
