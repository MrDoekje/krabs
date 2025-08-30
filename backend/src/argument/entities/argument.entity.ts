import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Command } from 'src/command/entities/command.entity';
import type { Relation } from 'typeorm';
@Entity()
export class Argument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  required: boolean;

  @ManyToOne(() => Command, (command: Command) => command.arguments, {
    cascade: ['insert', 'update'],
    onDelete: 'CASCADE',
  })
  command: Relation<Command>;
}
