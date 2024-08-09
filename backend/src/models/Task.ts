import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, AfterLoad, Index
} from 'typeorm';
import { Project } from './Project';
import { Label } from './Label';
import { Comment } from './Comment';
import {TaskAttachment} from "./TaskAttachment";
import {TaskHistory} from "./TaskHistory";
import {ProjectUser} from "./ProjectUser";

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  @Index()
  title!: string;

  @Column('text', { default: '' })
  @Index()
  description!: string;

  @Column({ length: 128, default: '' })
  @Index()
  status!: string;

  @ManyToOne(() => Project, project => project.tasks, { nullable: false })
  project!: Project;

  @ManyToOne(() => Label, label => label.tasks, { nullable: true })
  label!: Label;

  @Column('date', { nullable: true })
  dueDate!: Date;

  @Column({ length: 128, default: 'Medium' })
  priority!: string;

  @Column('int', { default: 0 })
  estimatedTime!: number;

  @Column('int', { default: 0 })
  actualTime!: number;

  @ManyToMany(() => ProjectUser, projectUser => projectUser.tasks)
  @JoinTable()
  assignees!: ProjectUser[];

  @Column({ length: 128, default: '' })
  @Index()
  type!: string;

  @Column('date', { nullable: true })
  plannedDate!: Date;

  @ManyToOne(() => Task, task => task.relatedTasks, { nullable: true })
  relatedTask!: Task;

  @ManyToOne(() => Project, project => project.tasks, { nullable: true })
  relatedTasks!: Task[];

  @Column('simple-array', { nullable: true })
  @Index()
  tags!: string[];

  @Column('simple-json', { nullable: true })
  customFields!: { [name: string]: string };

  @OneToMany(() => Comment, comment => comment.task)
  comments!: Comment[];

  @OneToMany(() => TaskAttachment, attachment => attachment.task)
  attachments!: TaskAttachment[];

  @OneToMany(() => TaskHistory, history => history.task)
  history!: TaskHistory[];

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
