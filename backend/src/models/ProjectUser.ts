import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Project } from './Project';

@Entity('project_users')
export class ProjectUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, project => project.projectUsers, { nullable: false })
  project!: Project;

  @ManyToOne(() => User, user => user.projectUsers, { nullable: false })
  user!: User;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
