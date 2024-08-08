import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm';
import { Project } from './Project';
import { Notification } from './Notification';
import { Comment } from './Comment';
import { Task } from './Task';
import { ProjectUser } from './ProjectUser';
import { TaskHistory } from './TaskHistory';
import { TaskTemplate } from './TaskTemplate';
import { Label } from './Label';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: true })
  apikey!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ default: false })
  twoFactorEnabled!: boolean;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  twoFactorSecret!: string | null;

  @Column({ type: 'text', nullable: true })
  @Exclude()
  resetPasswordToken!: string | null;

  @Column({ type: 'datetime', nullable: true })
  @Exclude()
  resetPasswordExpires!: Date | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => Project, (project) => project.owner)
  projects!: Project[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @ManyToMany(() => Project, (project) => project.users)
  @JoinTable()
  joinedProjects!: Project[];

  @ManyToMany(() => Task, task => task.assignees)
  tasks!: Task[];

  @OneToMany(() => ProjectUser, projectUser => projectUser.user)
  projectUsers!: ProjectUser[];

  @OneToMany(() => TaskHistory, history => history.user)
  history!: TaskHistory[];

  @OneToMany(() => TaskTemplate, taskTemplate => taskTemplate.user)
  taskTemplates!: TaskTemplate[];

  @OneToMany(() => Label, label => label.user)
  labels!: Label[];
}
