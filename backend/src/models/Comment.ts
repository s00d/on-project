import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from './User';
import { Task } from './Task';
import { Example } from 'tsoa';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number;

  @Column('text')
  @Example('This is a comment on the task.')
  content!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Example('http://example.com/attachment.png')
  attachment!: string | null;

  @ManyToOne(() => Task, (task) => task.comments, { nullable: false })
  @JoinColumn({ name: 'taskId' })
  @Example(1)
  task!: Task;

  @ManyToOne(() => User, (user) => user.comments, { nullable: false })
  @JoinColumn({ name: 'userId' })
  @Example(1)
  user!: User;

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
