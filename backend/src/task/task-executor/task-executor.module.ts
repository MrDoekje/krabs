import { Module } from '@nestjs/common';
import { TaskExecutorService } from './task-executor.service';
import { CommandModule } from 'src/command/command.module';
import { TaskResultModule } from 'src/task/task-result/task-result.module';
import { TaskRunModule } from 'src/task/task-run/task-run.module';
import { ActivityModule } from 'src/activity/activity.module';
import { TaskExecutorController } from './task-executor.controller';

@Module({
  imports: [CommandModule, TaskRunModule, TaskResultModule, ActivityModule],
  providers: [TaskExecutorService],
  exports: [TaskExecutorService],
  controllers: [TaskExecutorController],
})
export class TaskExecutorModule {}
