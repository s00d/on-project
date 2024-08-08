import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany
} from 'typeorm';
import { User } from './User';
import { Project } from './Project';
import {Task} from "./Task";

@Entity('project_users')
export class ProjectUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, project => project.projectUsers, { nullable: false })
  project!: Project;

  @ManyToOne(() => User, user => user.projectUsers, { nullable: false })
  user!: User;

  @ManyToMany(() => Task, task => task.assignees)
  tasks!: Task[];

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
