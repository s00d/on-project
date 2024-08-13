import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { Project } from './Project'
import { Sprint } from './Sprint'
import { Example } from 'tsoa'

@Entity('roadmaps')
export class Roadmap {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number

  @Column({ length: 128 })
  @Example('Release 1.0 Roadmap')
  title!: string

  @Column('text', { nullable: true })
  @Example('This roadmap outlines the goals and milestones for Release 1.0.')
  description!: string

  @ManyToOne(() => Project, (project) => project.roadmaps, { nullable: false })
  @Example(1)
  project!: Project

  @OneToMany(() => Sprint, (sprint) => sprint.roadmap, { cascade: true, onDelete: 'CASCADE' })
  @Example([
    { id: 1, title: 'Sprint 1' },
    { id: 2, title: 'Sprint 2' }
  ])
  sprints!: Sprint[]

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
