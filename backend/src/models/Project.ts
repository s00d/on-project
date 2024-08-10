/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - ownerId
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier for the project
 *           example: 1
 *         name:
 *           type: string
 *           description: The name of the project
 *           example: "New Website Development"
 *         description:
 *           type: string
 *           description: The description of the project
 *           nullable: true
 *           example: "This project involves the development of a new corporate website."
 *         savedFilters:
 *           type: string
 *           description: JSON string containing saved filters for the project
 *           example: '[]'
 *         customFields:
 *           type: string
 *           description: JSON string containing custom fields for the project
 *           example: '[]'
 *         priorities:
 *           type: string
 *           description: JSON string containing the list of task priorities
 *           example: '["Low", "Medium", "High"]'
 *         statuses:
 *           type: string
 *           description: JSON string containing the list of task statuses
 *           example: '["To Do", "In Progress", "Done"]'
 *         tags:
 *           type: string
 *           description: JSON string containing the list of tags used in the project
 *           example: '["tag1", "tag2"]'
 *         types:
 *           type: string
 *           description: JSON string containing the list of task types
 *           example: '["Frontend", "Backend", "Test", "Deploy", "Mixed"]'
 *         ownerId:
 *           type: integer
 *           description: The ID of the user who owns the project
 *           example: 1
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *           description: The list of tasks associated with the project
 *         labels:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Label'
 *           description: The list of labels associated with the project
 *         projectUsers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectUser'
 *           description: The list of users associated with the project
 *         roadmaps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Roadmap'
 *           description: The list of roadmaps associated with the project
 *         sprints:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Sprint'
 *           description: The list of sprints associated with the project
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the project was created
 *           example: "2023-08-01T12:34:56Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the project was last updated
 *           example: "2023-08-02T12:34:56Z"
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  RelationId,
  BeforeInsert,
  BeforeUpdate,
  AfterLoad,
  Index
} from 'typeorm'
import { User } from './User'
import { Task } from './Task'
import { Label } from './Label'
import { ProjectUser } from './ProjectUser'
import { Roadmap } from './Roadmap'
import { Exclude } from 'class-transformer'
import { Sprint } from './Sprint'

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 128 })
  @Index()
  name!: string

  @Column('text', { nullable: true })
  @Index()
  description!: string

  @Column('text', { default: '[]' })
  savedFilters!: string

  @Column('text', { default: '[]' })
  @Exclude()
  customFields!: string

  @Column('text', { default: '["Low", "Medium", "High"]' })
  @Exclude()
  priorities!: string

  @Column('text', { default: '["To Do", "In Progress", "Done"]' })
  @Exclude()
  statuses!: string

  @Column('text', { default: '["tag1", "tag2"]' })
  @Exclude()
  tags!: string

  @Column('text', { default: '["Frontend", "Backend", "Test", "Deploy", "Mixed"]' })
  @Exclude()
  types!: string

  // Связь с пользователем-владельцем проекта
  @ManyToOne(() => User, (user) => user.projects, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner!: User

  @RelationId((project: Project) => project.owner)
  ownerId!: number

  @OneToMany(() => Task, (task) => task.project, { cascade: true, onDelete: 'CASCADE' })
  tasks!: Task[]

  @OneToMany(() => Label, (label) => label.project, { cascade: true, onDelete: 'CASCADE' })
  labels!: Label[]

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  projectUsers!: ProjectUser[]

  @OneToMany(() => Roadmap, (roadmap) => roadmap.project, { cascade: true, onDelete: 'CASCADE' })
  roadmaps!: Roadmap[]

  @OneToMany(() => Sprint, (sprint) => sprint.project, { cascade: true, onDelete: 'CASCADE' }) // Добавляем связь со Sprint
  sprints!: Sprint[]

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Index()
  updatedAt!: Date

  @BeforeInsert()
  @BeforeUpdate()
  serializeFields() {
    this.savedFilters = JSON.stringify(this.savedFilters)
    this.customFields = JSON.stringify(this.customFields)
    this.priorities = JSON.stringify(this.priorities)
    this.statuses = JSON.stringify(this.statuses)
    this.tags = JSON.stringify(this.tags)
    this.types = JSON.stringify(this.types)
  }

  @AfterLoad()
  deserializeFields() {
    this.savedFilters = JSON.parse(this.savedFilters || '[]')
    this.customFields = JSON.parse(this.customFields || '[]')
    this.priorities = JSON.parse(this.priorities || '[]')
    this.statuses = JSON.parse(this.statuses || '[]')
    this.tags = JSON.parse(this.tags || '[]')
    this.types = JSON.parse(this.types || '[]')
  }
}
