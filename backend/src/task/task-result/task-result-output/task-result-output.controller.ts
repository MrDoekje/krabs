import { Controller, Get, Param } from '@nestjs/common';
import { TaskResultOutputService } from './task-result-output.service';
import { TaskResultOutput } from './entities/task-result-output.entity';

@Controller('task-result/output')
export class TaskResultOutputController {
  constructor(
    private readonly taskResultOutputService: TaskResultOutputService,
  ) {}

  @Get(':taskResultId')
  async findAll(
    @Param('taskResultId') taskResultId: string,
  ): Promise<TaskResultOutput[]> {
    return this.taskResultOutputService.findAll(taskResultId);
  }
}
