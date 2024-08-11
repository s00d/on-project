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

@Entity('roadmaps')
export class Roadmap {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 128 })
  title!: string

  @Column('text', { nullable: true })
  description!: string

  @ManyToOne(() => Project, (project) => project.roadmaps, { nullable: false })
  project!: Project

  @OneToMany(() => Sprint, (sprint) => sprint.roadmap, { cascade: true, onDelete: 'CASCADE' })
  sprints!: Sprint[]

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date
}
