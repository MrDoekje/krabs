import { Argument } from 'src/argument/entities/argument.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TaskCommand } from '../../task/entities/task-command.entity';

@Entity()
export class Command {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  wd: string;

  @Column()
  name: string;

  @Column()
  command: string;

  @ManyToMany(() => Argument, { eager: true })
  @JoinTable()
  arguments: Relation<Argument>[];

  @Column()
  format: string;

  @Column({ default: false })
  optional: boolean;

  @OneToMany(() => TaskCommand, (taskCommand) => taskCommand.command)
  taskCommands: Relation<TaskCommand>[];
}
