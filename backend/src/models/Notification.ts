import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from './User'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.notifications, { nullable: false })
  user!: User

  @Column({ length: 255 })
  message!: string

  @Column({ default: false })
  read!: boolean

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date
}
