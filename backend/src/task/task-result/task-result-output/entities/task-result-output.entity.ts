import type { Relation } from 'typeorm';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class TaskResultOutput {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TaskResult, (taskResult) => taskResult.output, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  taskResult: Relation<TaskResult>;

  @Column({ type: 'text' })
  line: string;

  @CreateDateColumn()
  createdAt: Date;
}
