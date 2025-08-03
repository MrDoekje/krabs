import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskConsumer } from './task.consumer';
import { Task } from 'src/task/entities/task.entity';
import { TaskCommand } from 'src/task/task-command/entities/task-command.entity';
import { Command } from 'src/command/entities/command.entity';
import { Argument } from 'src/argument/entities/argument.entity';
import { TaskExecutorModule } from 'src/task/task-executor/task-executor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskCommand, Command, Argument]),
    BullModule.registerQueue({
      name: 'task',
    }),
    TaskExecutorModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskConsumer],
  exports: [TaskService],
})
export class TaskModule {}
