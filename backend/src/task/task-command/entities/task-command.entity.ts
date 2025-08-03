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
import { Command } from 'src/command/entities/command.entity';

@Entity()
export class TaskCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.taskCommands, {
    onDelete: 'CASCADE',
  })
  task: Relation<Task>;

  @ManyToOne(() => Command, (command) => command.taskCommands, {
    onDelete: 'CASCADE',
    eager: true,
  })
  command: Relation<Command>;

  @Column({ type: 'integer' })
  executionOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
