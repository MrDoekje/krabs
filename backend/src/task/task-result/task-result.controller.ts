import { Controller, Get, Param } from '@nestjs/common';
import { TaskResultService } from './task-result.service';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';

@Controller('task-result')
export class TaskResultController {
  constructor(private readonly taskResultService: TaskResultService) {}

  /**
   * Get task results by task name
   */
  @Get(':taskName')
  async getResultsByTaskName(
    @Param('taskName') taskName: string,
  ): Promise<TaskResult[]> {
    return this.taskResultService.getResultsByTaskName(taskName);
  }
}
