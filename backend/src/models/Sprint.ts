import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, Index
} from 'typeorm';
import { Roadmap } from './Roadmap';
import {Task} from "./Task";
import {Project} from "./Project";

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  title!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('date')
  startDate!: Date;

  @Column('date')
  endDate!: Date;

  @ManyToOne(() => Roadmap, roadmap => roadmap.sprints, { nullable: false })
  roadmap!: Roadmap;

  @OneToMany(() => Task, task => task.sprint)  // Добавляем связь с задачами
  tasks!: Task[];

  @ManyToOne(() => Project, project => project.sprints, { nullable: false })  // Связь с проектом
  project!: Project;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  @Index()
  updatedAt!: Date;
}
