import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Project } from './Project';
import { User } from './User';
import { Example } from 'tsoa';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number;

  @ManyToOne(() => Project, (project) => project.documents, { nullable: false })
  @JoinColumn({ name: 'projectId' })
  @Example(1)
  project!: Project;

  @ManyToOne(() => User, (user) => user.documents, { nullable: false })
  @JoinColumn({ name: 'userId' })
  @Example(1)
  user!: User;

  @Column({ length: 255 })
  @Example('Technical task')
  title!: string;

  @Column('text', { nullable: true })
  @Example('Description of the document or its contents')
  description!: string;

  @Column({ length: 255 })
  @Example('/uploads/documents/tech_spec.pdf')
  filePath!: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Example('2024-08-11T00:00:00Z')
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Example('2024-08-11T00:00:00Z')
  updatedAt!: Date;
}
