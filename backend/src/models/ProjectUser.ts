import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany
} from 'typeorm';
import { User } from './User';
import { Project } from './Project';
import { Task } from './Task';
import { Example } from 'tsoa';

@Entity('project_users')
export class ProjectUser {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number;

  @ManyToOne(() => Project, (project) => project.projectUsers)
  @Example(1)
  project!: Project;

  @ManyToOne(() => User, (user) => user.projectUsers, { nullable: false })
  @Example(1)
  user!: User;

  @ManyToMany(() => Task, (task) => task.assignees)
  @Example([1, 2])
  tasks!: Task[];

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Example('2024-08-11T00:00:00Z')
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Example('2024-08-11T00:00:00Z')
  updatedAt?: Date;
}
