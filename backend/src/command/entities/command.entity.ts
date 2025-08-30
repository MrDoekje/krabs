import { Argument } from 'src/argument/entities/argument.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { TaskCommand } from 'src/task/task-command/entities/task-command.entity';

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

  @OneToMany(() => Argument, (argument: Argument) => argument.command, {
    eager: true,
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  arguments: Relation<Argument>[];

  @Column()
  format: string;

  @Column({ default: false })
  optional: boolean;

  @OneToMany(() => TaskCommand, (taskCommand) => taskCommand.command, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  taskCommands: Relation<TaskCommand>[];
}
