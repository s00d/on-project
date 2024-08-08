import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('task_templates')
export class TaskTemplate {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.taskTemplates, { nullable: false })
  user!: User;

  @Column()
  title!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column({ default: 'Medium' })
  priority!: string;

  @Column({ default: '' })
  status!: string;

  @Column({ default: '' })
  tag!: string;

  @Column({ default: '' })
  type!: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
