import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from './User'
import { Example } from 'tsoa'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  @Example(1)
  id!: number

  @ManyToOne(() => User, (user) => user.notifications, { nullable: false })
  @Example(1)
  user!: User

  @Column({ length: 255 })
  @Example('You have a new message.')
  message!: string

  @Column({ default: false })
  @Example(false)
  read!: boolean

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @Example('2024-08-11T00:00:00Z')
  createdAt!: Date

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  @Example('2024-08-11T00:00:00Z')
  updatedAt!: Date
}
