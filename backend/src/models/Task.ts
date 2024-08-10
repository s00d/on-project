/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the task.
 *           example: 1
 *         title:
 *           type: string
 *           description: The title of the task.
 *           example: "Implement login feature"
 *         description:
 *           type: string
 *           description: A detailed description of the task.
 *           example: "The login feature should include email and password authentication."
 *         status:
 *           type: string
 *           description: The current status of the task.
 *           example: "In Progress"
 *         project:
 *           $ref: '#/components/schemas/Project'
 *           description: The project to which the task belongs.
 *         label:
 *           $ref: '#/components/schemas/Label'
 *           description: The label associated with the task.
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: The start date of the task.
 *           example: "2023-09-01T08:00:00Z"
 *         stopDate:
 *           type: string
 *           format: date-time
 *           description: The stop date of the task.
 *           example: "2023-09-10T17:00:00Z"
 *         dueDate:
 *           type: string
 *           format: date
 *           description: The due date of the task.
 *           example: "2023-09-15"
 *         priority:
 *           type: string
 *           description: The priority level of the task.
 *           example: "High"
 *         estimatedTime:
 *           type: integer
 *           description: The estimated time to complete the task, in hours.
 *           example: 8
 *         actualTime:
 *           type: integer
 *           description: The actual time taken to complete the task, in hours.
 *           example: 10
 *         assignees:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectUser'
 *           description: The users assigned to the task.
 *         type:
 *           type: string
 *           description: The type of task (e.g., "Bug", "Feature").
 *           example: "Feature"
 *         plannedDate:
 *           type: string
 *           format: date
 *           description: The planned date for the task.
 *           example: "2023-09-05"
 *         relatedTask:
 *           $ref: '#/components/schemas/Task'
 *           description: A related task.
 *         sprint:
 *           $ref: '#/components/schemas/Sprint'
 *           description: The sprint in which the task is included.
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with the task.
 *           example: ["frontend", "backend"]
 *         customFields:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Custom fields associated with the task.
 *           example: { "field1": "value1", "field2": "value2" }
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *           description: Comments made on the task.
 *         attachments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskAttachment'
 *           description: Files attached to the task.
 *         history:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskHistory'
 *           description: The history of changes made to the task.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the task was created.
 *           example: "2023-08-01T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the task was last updated.
 *           example: "2023-08-02T12:34:56Z"
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, Index, JoinColumn, RelationId
} from 'typeorm';
import { Project } from './Project';
import { Label } from './Label';
import { Comment } from './Comment';
import {TaskAttachment} from "./TaskAttachment";
import {TaskHistory} from "./TaskHistory";
import {ProjectUser} from "./ProjectUser";
import {Sprint} from "./Sprint";
import {User} from "./User";

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

  @Column('datetime', { nullable: true })
  @Index()
  startDate!: Date|null;

  @Column('datetime', { nullable: true })
  @Index()
  stopDate!: Date|null;

  @Column('date', { nullable: true })
  @Index()
  dueDate!: Date|null;

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

  @ManyToOne(() => Task, task => task.sprint, { nullable: true })
  @JoinColumn({ name: 'sprintId' })
  sprint!: Sprint|null;

  @RelationId((task: Task) => task.sprint)
  sprintId!: number;

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
  @Index()
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  @Index()
  updatedAt!: Date;
}
