import { Controller, Get, Param } from '@nestjs/common';
import { TaskResultService } from './task-result.service';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';

@Controller('task-result')
export class TaskResultController {
  constructor(private readonly taskResultService: TaskResultService) {}

  /**
   * Get task results by task result ID
   */
  @Get(':taskResultId')
  async getResultsByTaskResultId(
    @Param('taskResultId') taskResultId: string,
  ): Promise<TaskResult> {
    return this.taskResultService.getResultsByTaskResultId(taskResultId);
  }
}
