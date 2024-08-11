import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './User';
import { Project } from './Project';

@Entity('task_templates')
export class TaskTemplate {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.taskTemplates, { nullable: false })
  user!: User;

  @ManyToOne(() => Project, (project) => project.taskTemplates, { nullable: false, onDelete: 'CASCADE' })
  project!: Project;

  @Column()
  title!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column({ default: 'Medium' })
  priority!: string;

  @Column({ default: '' })
  status!: string;

  @Column({ default: '' })
  tag!: string;

  @Column({ default: '' })
  type!: string;

  @Column('int', { default: 0 })
  estimatedTime!: number;

  @Column('int', { default: 0 })
  actualTime!: number;

  @Column('simple-json', { nullable: true })
  customFields!: null | { [name: string]: string };

  @Column('simple-array', { nullable: true })
  tags!: string[];

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
