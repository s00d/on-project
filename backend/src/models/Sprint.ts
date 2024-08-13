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
import { Roadmap } from './Roadmap'
import { Task } from './Task'
import { Project } from './Project'
import { Example } from 'tsoa'

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number

  @Column({ length: 128 })
  @Example('Sprint 1')
  title!: string

  @Column('text', { nullable: true })
  @Example('This sprint focuses on the initial implementation of the project.')
  description!: string

  @Column('date')
  @Example('2024-08-11')
  startDate!: Date

  @Column('date')
  @Example('2024-08-25')
  endDate!: Date

  @ManyToOne(() => Roadmap, (roadmap) => roadmap.sprints, { nullable: false })
  @Example(1)
  roadmap!: Roadmap

  @OneToMany(() => Task, (task) => task.sprint)
  @Example([
    { id: 1, title: 'Task 1' },
    { id: 2, title: 'Task 2' }
  ])
  tasks!: Task[]

  @ManyToOne(() => Project, (project) => project.sprints, { nullable: false })
  @Example(1)
  project!: Project

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
}
