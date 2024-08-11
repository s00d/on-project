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
} from 'typeorm';
import { User } from './User';
import { Task } from './Task';
import { Label } from './Label';
import { ProjectUser } from './ProjectUser';
import { Roadmap } from './Roadmap';
import { Exclude } from 'class-transformer';
import { Sprint } from './Sprint';
import { TaskTemplate } from "./TaskTemplate";
import { Example } from 'tsoa';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number;

  @Column({ length: 10 })
  @Index()
  @Example('Project Alpha')
  name!: string;

  @Column('text', { nullable: true })
  @Index()
  @Example('This is a sample project description.')
  description!: string;

  @Column('text', { default: '[]' })
  @Example('["filter1", "filter2"]')
  savedFilters!: string;

  @Column('text', { default: '[]' })
  @Exclude()
  @Example('[{"field1": "value1"}, {"field2": "value2"}]')
  customFields!: string;

  @Column('text', { default: '["Low", "Medium", "High"]' })
  @Exclude()
  @Example('["Low", "Medium", "High"]')
  priorities!: string;

  @Column('text', { default: '["To Do", "In Progress", "Done"]' })
  @Exclude()
  @Example('["To Do", "In Progress", "Done"]')
  statuses!: string;

  @Column('text', { default: '["tag1", "tag2"]' })
  @Exclude()
  @Example('["tag1", "tag2"]')
  tags!: string;

  @Column('text', { default: '["Frontend", "Backend", "Test", "Deploy", "Mixed"]' })
  @Exclude()
  @Example('["Frontend", "Backend", "Test", "Deploy", "Mixed"]')
  types!: string;

  @Column({ default: false })
  @Example(false)
  @Index()
  isArchived!: boolean;

  @ManyToOne(() => User, (user) => user.projects, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  @Example(1)
  owner!: User;

  @RelationId((project: Project) => project.owner)
  @Example(1)
  ownerId!: number;

  @OneToMany(() => Task, (task) => task.project, { cascade: true, onDelete: 'CASCADE' })
  tasks!: Task[];

  @OneToMany(() => Label, (label) => label.project, { cascade: true, onDelete: 'CASCADE' })
  labels!: Label[];

  @OneToMany(() => TaskTemplate, (taskTemplate) => taskTemplate.project, { cascade: true, onDelete: 'CASCADE' })
  taskTemplates!: TaskTemplate[];

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  projectUsers!: ProjectUser[];

  @OneToMany(() => Roadmap, (roadmap) => roadmap.project, { cascade: true, onDelete: 'CASCADE' })
  roadmaps!: Roadmap[];

  @OneToMany(() => Sprint, (sprint) => sprint.project, { cascade: true, onDelete: 'CASCADE' })
  sprints!: Sprint[];

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  @Example('2024-08-11T00:00:00Z')
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Index()
  @Example('2024-08-11T00:00:00Z')
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  serializeFields() {
    this.savedFilters = JSON.stringify(this.savedFilters);
    this.customFields = JSON.stringify(this.customFields);
    this.priorities = JSON.stringify(this.priorities);
    this.statuses = JSON.stringify(this.statuses);
    this.tags = JSON.stringify(this.tags);
    this.types = JSON.stringify(this.types);
  }

  @AfterLoad()
  deserializeFields() {
    this.savedFilters = JSON.parse(this.savedFilters || '[]');
    this.customFields = JSON.parse(this.customFields || '[]');
    this.priorities = JSON.parse(this.priorities || '[]');
    this.statuses = JSON.parse(this.statuses || '[]');
    this.tags = JSON.parse(this.tags || '[]');
    this.types = JSON.parse(this.types || '[]');
  }
}
