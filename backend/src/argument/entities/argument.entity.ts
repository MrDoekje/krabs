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

  // TODO; should just be one to many
  @ManyToMany(() => Command, (command: Command) => command.arguments, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  commands: Relation<Command>[];
}
