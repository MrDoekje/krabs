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
import { TaskRun } from 'src/task/task-run/entities/task-run.entity';
import { TaskResultStatus } from 'src/task/task-result/types';

@Entity()
export class TaskResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.results, {
    nullable: false,
  })
  task: Relation<Task>;

  @ManyToOne(() => TaskRun, (taskRun) => taskRun.results, {
    nullable: true,
  })
  taskRun?: Relation<TaskRun>;

  // TODO: put output in a separate table
  @Column({ type: 'text', nullable: true })
  output: string | null;

  @Column({
    type: 'text',
    default: TaskResultStatus.IN_PROGRESS,
  })
  status: TaskResultStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
