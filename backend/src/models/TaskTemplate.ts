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
import { Example } from 'tsoa';

@Entity('task_templates')
export class TaskTemplate {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number;

  @ManyToOne(() => User, (user) => user.taskTemplates, { nullable: false })
  @Example(1)
  user!: User;

  @ManyToOne(() => Project, (project) => project.taskTemplates, { nullable: false, onDelete: 'CASCADE' })
  @Example(1)
  project!: Project;

  @Column()
  @Example('Implement feature X')
  title!: string;

  @Column('text', { nullable: true })
  @Example('This task template is for implementing feature X.')
  description!: string;

  @Column({ default: 'Medium' })
  @Example('Medium')
  priority!: string;

  @Column({ default: '' })
  @Example('To Do')
  status!: string;

  @Column({ default: '' })
  @Example('feature')
  tag!: string;

  @Column({ default: '' })
  @Example('Bug')
  type!: string;

  @Column('int', { default: 0 })
  @Example(8)
  estimatedTime!: number;

  @Column('int', { default: 0 })
  @Example(0)
  actualTime!: number;

  @Column('simple-json', { nullable: true })
  @Example({ customField1: 'value1', customField2: 'value2' })
  customFields!: null | { [name: string]: string };

  @Column('simple-array', { nullable: true })
  @Example(['frontend', 'backend'])
  tags!: string[];

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Example('2024-08-11T00:00:00Z')
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  @Example('2024-08-11T00:00:00Z')
  updatedAt!: Date;
}
