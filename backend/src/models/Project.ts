import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
  RelationId,
  BeforeInsert,
  BeforeUpdate, AfterLoad, Index
} from 'typeorm';
import { User } from './User';
import { Task } from './Task';
import { Label } from './Label';
import { ProjectUser } from './ProjectUser';
import { Roadmap } from './Roadmap';
import { Exclude } from "class-transformer";
import {Sprint} from "./Sprint";

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  @Index()
  name!: string;

  @Column('text', { nullable: true })
  @Index()
  description!: string;

  @Column('text', { default: '[]' })
  savedFilters!: string;

  @Column('text', { default: '[]' })
  @Exclude()
  customFields!: string;

  @Column('text', { default: '["Low", "Medium", "High"]' })
  @Exclude()
  priorities!: string;

  @Column('text', { default: '["To Do", "In Progress", "Done"]' })
  @Exclude()
  statuses!: string;

  @Column('text', { default: '["tag1", "tag2"]' })
  @Exclude()
  tags!: string;

  @Column('text', { default: '["Frontend", "Backend", "Test", "Deploy", "Mixed"]' })
  @Exclude()
  types!: string;

  @ManyToOne(() => User, user => user.projects, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @RelationId((project: Project) => project.owner)
  ownerId!: number;

  @OneToMany(() => Task, task => task.project)
  tasks!: Task[];

  @OneToMany(() => Label, label => label.project)
  labels!: Label[];

  @OneToMany(() => ProjectUser, projectUser => projectUser.project)
  projectUsers!: ProjectUser[];

  @OneToMany(() => Roadmap, roadmap => roadmap.project)
  roadmaps!: Roadmap[];

  @ManyToMany(() => User, user => user.joinedProjects)
  @JoinTable()
  users!: User[];

  @OneToMany(() => Sprint, sprint => sprint.project)  // Добавляем связь со Sprint
  sprints!: Sprint[];

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
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
