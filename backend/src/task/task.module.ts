import { forwardRef, Module } from '@nestjs/common';
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
import { ActivityModule } from 'src/activity/activity.module';
import { TaskRun } from './task-run/entities/task-run.entity';
import { TaskRunModule } from './task-run/task-run.module';
import { TaskResultModule } from './task-result/task-result.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskCommand, Command, Argument, TaskRun]),
    BullModule.registerQueue({
      name: 'task',
    }),
    TaskExecutorModule,
    ActivityModule,
    TaskResultModule,
    forwardRef(() => TaskRunModule),
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskConsumer],
  exports: [TaskService],
})
export class TaskModule {}
