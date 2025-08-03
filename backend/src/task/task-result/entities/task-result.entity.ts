import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Task } from 'src/task/entities/task.entity';

@Entity()
export class TaskResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.results, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  task: Relation<Task>;

  @Column({ type: 'text', nullable: true })
  output: string | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'boolean', default: false })
  success: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
