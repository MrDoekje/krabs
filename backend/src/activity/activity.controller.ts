import {
  Controller,
  Get,
  Param,
  Delete,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { TaskRun } from 'src/task/task-run/entities/task-run.entity';

@Controller('activity')
export class ActivityController {
  // Get all current activity (list of TaskRun)
  @Get('tasks')
  async getAllActiveTasks(): Promise<TaskRun[]> {
    throw new NotImplementedException('This method is not implemented yet');
  }

  // Stop a specific task from being run
  @Delete('tasks/:taskRunId')
  async stopTask(
    @Param('taskRunId') taskRunId: string,
  ): Promise<{ success: boolean }> {
    throw new NotImplementedException('This method is not implemented yet');
  }
}
