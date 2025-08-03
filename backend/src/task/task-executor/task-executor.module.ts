import { Module } from '@nestjs/common';
import { TaskExecutorService } from './task-executor.service';
import { CommandModule } from 'src/command/command.module';
import { TaskResultModule } from 'src/task/task-result/task-result.module';
import { TaskRunModule } from 'src/task/task-run/task-run.module';

@Module({
  imports: [CommandModule, TaskRunModule, TaskResultModule],
  providers: [TaskExecutorService],
  exports: [TaskExecutorService],
})
export class TaskExecutorModule {}
