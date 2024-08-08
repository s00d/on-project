import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Task } from './Task';

@Entity('task_attachments')
export class TaskAttachment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Task, task => task.attachments, { nullable: false })
  task!: Task;

  @Column({ length: 128 })
  filename!: string;

  @Column({ length: 255 })
  filePath!: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
