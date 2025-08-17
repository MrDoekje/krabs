import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject } from 'rxjs';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { Repository } from 'typeorm';
import { ActivityDto } from 'src/activity/dto/activity.dto';
import { TaskResultStatus } from 'src/task/task-result/types';

@Injectable()
export class ActivityService {
  private taskResultStreams = new Map<string, Subject<ActivityDto>>();

  constructor(
    @InjectRepository(TaskResult)
    private readonly taskResultRepository: Repository<TaskResult>,
  ) {}

  async getAllQueuedTasks(): Promise<TaskResult[]> {
    return this.taskResultRepository.find({
      where: { status: TaskResultStatus.IN_PROGRESS },
    });
  }

  getCurrentTaskResults(taskResultId: string): Observable<ActivityDto> {
    return this.getTaskResultSubject(taskResultId).asObservable();
  }

  //   TODO: create method to 'prune' list of task results with 'pending' that are not actually in the queue

  private getTaskResultSubject(taskResultId: string): Subject<ActivityDto> {
    let stream = this.taskResultStreams.get(taskResultId);
    if (!stream) {
      stream = new Subject<ActivityDto>();
      this.taskResultStreams.set(taskResultId, stream);
    }

    return stream;
  }

  stopTaskResult(taskResultId: string): Promise<{ success: boolean }> {
    // TODO: implement a way to stop the task result from being processed
    // TODO: stop gracefully
    throw new NotImplementedException(
      'stopTaskResult method is not implemented yet',
    );
  }

  emitToTaskResult(taskResultId: string, data: ActivityDto) {
    const stream = this.getTaskResultSubject(taskResultId);
    if (stream) {
      stream.next(data);
    }
    // todo: if task result is done, clean up the stream
  }
}
