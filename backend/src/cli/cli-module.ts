import { Module } from '@nestjs/common';
import { CliController } from './cli.controller';
import { TaskModule } from 'src/task/task.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Argument } from 'src/argument/entities/argument.entity';
import { Command } from 'src/command/entities/command.entity';
import { Task } from 'src/task/entities/task.entity';
import { TaskCommand } from 'src/task/task-command/entities/task-command.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskCommand, Command, Argument]),
    TaskModule,
  ],
  controllers: [CliController],
})
export class CliModule {}
