/**
 * @swagger
 * components:
 *   schemas:
 *     Roadmap:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the roadmap.
 *           example: 1
 *         title:
 *           type: string
 *           description: The title of the roadmap.
 *           example: "Product Launch Roadmap"
 *         description:
 *           type: string
 *           nullable: true
 *           description: A detailed description of the roadmap.
 *           example: "This roadmap outlines the key sprints for the upcoming product launch."
 *         project:
 *           $ref: '#/components/schemas/Project'
 *           description: The project associated with this roadmap.
 *         sprints:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Sprint'
 *           description: The list of sprints included in the roadmap.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the roadmap was created.
 *           example: "2023-08-01T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the roadmap was last updated.
 *           example: "2023-08-02T12:34:56Z"
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Project } from './Project';
import {Sprint} from "./Sprint";

@Entity('roadmaps')
export class Roadmap {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  title!: string;

  @Column('text', { nullable: true })
  description!: string;

  @ManyToOne(() => Project, project => project.roadmaps, { nullable: false })
  project!: Project;

  @OneToMany(() => Sprint, sprint => sprint.roadmap, { cascade: true, onDelete: 'CASCADE' })
  sprints!: Sprint[];

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
