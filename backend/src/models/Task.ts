import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, AfterLoad
} from 'typeorm';
import { Project } from './Project';
import { User } from './User';
import { Label } from './Label';
import { Comment } from './Comment';
import {TaskAttachment} from "./TaskAttachment";
import {TaskHistory} from "./TaskHistory";

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  title!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column({ length: 128 })
  status!: string;

  @ManyToOne(() => Project, project => project.tasks, { nullable: false })
  project!: Project;

  @ManyToMany(() => User, user => user.tasks)
  @JoinTable()
  assignees!: User[];

  @ManyToOne(() => Label, label => label.tasks, { nullable: true })
  label!: Label;

  @Column('date', { nullable: true })
  dueDate!: Date;

  @Column({ length: 128, default: 'Medium' })
  priority!: string;

  @Column('int', { nullable: true })
  estimatedTime!: number;

  @Column('int', { nullable: true })
  actualTime!: number;

  @Column('simple-array', { nullable: true })
  assigneeIds!: number[];

  @Column({ length: 128, nullable: true })
  type!: string;

  @Column('date', { nullable: true })
  plannedDate!: Date;

  @ManyToOne(() => Task, task => task.relatedTasks, { nullable: true })
  relatedTask!: Task;

  @ManyToOne(() => Project, project => project.tasks, { nullable: true })
  relatedTasks!: Task[];

  @Column('simple-array', { nullable: true })
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
