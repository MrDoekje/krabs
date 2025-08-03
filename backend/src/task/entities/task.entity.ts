import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { TaskCommand } from 'src/task/task-command/entities/task-command.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  queued: boolean;

  @OneToMany(() => TaskCommand, (taskCommand) => taskCommand.task, {
    cascade: true,
    eager: true,
  })
  taskCommands: Relation<TaskCommand>[];

  @OneToMany(() => TaskResult, (result) => result.task, {
    cascade: true,
  })
  results: Relation<TaskResult>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
