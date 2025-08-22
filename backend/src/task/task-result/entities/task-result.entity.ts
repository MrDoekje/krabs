import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Task } from 'src/task/entities/task.entity';
import { TaskRun } from 'src/task/task-run/entities/task-run.entity';
import { TaskResultStatus } from 'src/task/task-result/types';
import { TaskResultOutput } from 'src/task/task-result/task-result-output/entities/task-result-output.entity';

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

  @OneToMany(() => TaskResultOutput, (output) => output.taskResult, {
    cascade: true,
  })
  output?: Relation<TaskResultOutput[]>;

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
