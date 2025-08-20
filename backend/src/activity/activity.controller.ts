import { Controller, Get, Param, Delete, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ActivityService } from 'src/activity/activity.service';
import { ActivityDto } from 'src/activity/dto/activity.dto';
import { Task } from 'src/task/entities/task.entity';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { QueueDto } from 'src/activity/dto/queue.dto';
import { QueuedTaskDto } from './dto/queuedTask.dto';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  // TODO: use task-result findAll method with filters instead
  @Get('task-result')
  async getAllActiveTaskResults(): Promise<TaskResult[]> {
    return this.activityService.getAllActiveTaskResults();
  }

  @Get('queue')
  async getAllQueued(): Promise<QueuedTaskDto[]> {
    return this.activityService.getAllQueued();
  }

  @Sse('task-result/:taskResultId')
  getCurrentTaskResults(
    @Param('taskResultId') taskResultId: string,
  ): Observable<ActivityDto> {
    return this.activityService.getCurrentTaskResults(taskResultId);
  }

  @Sse('queue-events')
  trackQueue(): Observable<QueueDto> {
    return this.activityService.trackQueue();
  }

  @Delete('task-result/:taskResultId')
  async stopTask(
    @Param('taskResultId') taskResultId: string,
  ): Promise<{ success: boolean }> {
    return this.activityService.stopTaskResult(taskResultId);
  }
}
