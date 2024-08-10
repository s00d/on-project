/**
 * @swagger
 * components:
 *   schemas:
 *     Sprint:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the sprint.
 *           example: 1
 *         title:
 *           type: string
 *           description: The title of the sprint.
 *           example: "Sprint 1"
 *         description:
 *           type: string
 *           nullable: true
 *           description: A detailed description of the sprint.
 *           example: "This sprint focuses on implementing the user authentication module."
 *         startDate:
 *           type: string
 *           format: date
 *           description: The start date of the sprint.
 *           example: "2023-09-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: The end date of the sprint.
 *           example: "2023-09-14"
 *         roadmap:
 *           $ref: '#/components/schemas/Roadmap'
 *           description: The roadmap associated with this sprint.
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *           description: The list of tasks included in the sprint.
 *         project:
 *           $ref: '#/components/schemas/Project'
 *           description: The project associated with this sprint.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the sprint was created.
 *           example: "2023-08-01T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the sprint was last updated.
 *           example: "2023-08-02T12:34:56Z"
 */

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
