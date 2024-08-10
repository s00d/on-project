/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the project user association.
 *           example: 1
 *         project:
 *           $ref: '#/components/schemas/Project'
 *           description: The project associated with the user.
 *         user:
 *           $ref: '#/components/schemas/User'
 *           description: The user associated with the project.
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *           description: The list of tasks assigned to the user in the project.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the record was created.
 *           example: "2023-08-01T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the record was last updated.
 *           example: "2023-08-02T12:34:56Z"
 */

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
import {Task} from "./Task";

@Entity('project_users')
export class ProjectUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Project, project => project.projectUsers)
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
