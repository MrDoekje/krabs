import { Controller, Get, Param, Delete, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ActivityService } from 'src/activity/activity.service';
import { ActivityDto } from 'src/activity/dto/activity.dto';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('task-result')
  async getAllQueuedTasks(): Promise<TaskResult[]> {
    return this.activityService.getAllQueuedTasks();
  }

  @Sse('task-result/:taskResultId')
  getUserStream({
    params,
  }: {
    params: { taskResultId: string };
  }): Observable<ActivityDto> {
    const taskResultId = params.taskResultId;
    return this.activityService.getCurrentTaskResults(taskResultId);
  }

  @Delete('task-result/:taskResultId')
  async stopTask(
    @Param('taskResultId') taskResultId: string,
  ): Promise<{ success: boolean }> {
    return this.activityService.stopTaskResult(taskResultId);
  }
}
