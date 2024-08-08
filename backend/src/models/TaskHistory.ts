import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity('task_histories')
export class TaskHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Task, task => task.history, { nullable: false })
  task!: Task;

  @ManyToOne(() => User, user => user.history, { nullable: false })
  user!: User;

  @Column({ length: 128 })
  action!: string;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
