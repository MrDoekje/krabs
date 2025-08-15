import { Module } from '@nestjs/common';
import { CommandService } from 'src/command/command.service';
import { CommandController } from 'src/command/command.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Argument } from 'src/argument/entities/argument.entity';
import { Task } from 'src/task/entities/task.entity';
import { TaskCommand } from 'src/task/task-command/entities/task-command.entity';
import { Command } from 'src/command/entities/command.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskCommand, Command, Argument])],
  controllers: [CommandController],
  providers: [CommandService],
  exports: [CommandService],
})
export class CommandModule {}
