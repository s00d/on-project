import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Task } from './Task';
import { Example } from 'tsoa';

@Entity('task_attachments')
export class TaskAttachment {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number;

  @ManyToOne(() => Task, (task) => task.attachments, { nullable: false })
  @Example(1)
  task!: Task;

  @Column({ length: 128 })
  @Example('document.pdf')
  filename!: string;

  @Column({ length: 255 })
  @Example('/uploads/documents/document.pdf')
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
