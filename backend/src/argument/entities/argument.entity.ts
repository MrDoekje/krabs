import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Command } from 'src/command/entities/command.entity';
import { ManyToMany, JoinTable } from 'typeorm';
import type { Relation } from 'typeorm';
@Entity()
export class Argument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  required: boolean;

  @ManyToMany(() => Command, (command: Command) => command.arguments, {})
  @JoinTable()
  commands: Relation<Command>[];
}
