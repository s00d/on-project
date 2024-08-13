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
import { Example } from 'tsoa'

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number

  @ManyToOne(() => Project, (project) => project.labels, { nullable: false })
  @Example(1)
  project!: Project

  @ManyToOne(() => User, (user) => user.labels, { nullable: false })
  @Example(1)
  user!: User

  @OneToMany(() => Task, (task) => task.label)
  @Example([1, 2])
  tasks!: Task[]

  @Column({ length: 128 })
  @Index()
  @Example('Bug')
  name!: string

  @Column({ length: 7 })
  @Example('#FF5733')
  color!: string

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Example('2024-08-11T00:00:00Z')
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Example('2024-08-11T00:00:00Z')
  updatedAt!: Date
}
