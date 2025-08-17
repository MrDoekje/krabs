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
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';

@Entity()
export class TaskRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Task, {
    onDelete: 'CASCADE',
  })
  task: Relation<Task>;

  @ManyToOne(() => TaskResult)
  results: Relation<TaskResult>;

  @Column({ type: 'json' })
  commandArguments: Record<string, Record<string, string>>;

  @Column({ default: false })
  favorited: boolean;

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
