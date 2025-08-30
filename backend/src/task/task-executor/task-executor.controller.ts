import { Controller, Delete, Param } from '@nestjs/common';
import { TaskExecutorService } from './task-executor.service';

@Controller('tasks/executor')
export class TaskExecutorController {
  constructor(private readonly taskExecutorService: TaskExecutorService) {}

  /**
   * Get task results by task result ID
   */
  @Delete(':taskResultId')
  stopTaskResultExecution(@Param('taskResultId') taskResultId: string): void {
    this.taskExecutorService.stopTaskResultExecution(taskResultId);
  }
}
