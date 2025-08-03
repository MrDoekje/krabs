import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskConsumer } from './task.consumer';
import { Task } from 'src/task/entities/task.entity';
import { TaskResult } from 'src/task/entities/task-result.entity';
import { TaskCommand } from 'src/task/entities/task-command.entity';
import { TaskRun } from 'src/task/entities/task-run.entity';
import { Command } from 'src/command/entities/command.entity';
import { Argument } from 'src/argument/entities/argument.entity';
import { ExecutorModule } from 'src/executor/executor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskResult,
      TaskCommand,
      TaskRun,
      Command,
      Argument,
    ]),
    BullModule.registerQueue({
      name: 'task',
    }),
    ExecutorModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskConsumer],
  exports: [TaskService],
})
export class TaskModule {}
