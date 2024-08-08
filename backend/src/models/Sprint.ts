import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Roadmap } from './Roadmap';

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 128 })
  title!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('date')
  startDate!: Date;

  @Column('date')
  endDate!: Date;

  @ManyToOne(() => Roadmap, roadmap => roadmap.sprints, { nullable: false })
  roadmap!: Roadmap;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
