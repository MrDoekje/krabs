import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, Subject } from 'rxjs';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { In, Repository } from 'typeorm';
import { ActivityDto } from 'src/activity/dto/activity.dto';
import { TaskResultStatus } from 'src/task/task-result/types';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Task } from 'src/task/entities/task.entity';
import { QueueDto } from 'src/activity/dto/queue.dto';

@Injectable()
export class ActivityService {
  private taskResultStreams = new Map<string, Subject<ActivityDto>>();
  private queueSubject = new Subject<QueueDto>();

  constructor(
    @InjectRepository(TaskResult)
    private readonly taskResultRepository: Repository<TaskResult>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectQueue('task') private readonly taskQueue: Queue,
  ) {}

  async getAllActiveTaskResults(): Promise<TaskResult[]> {
    // await this.taskResultRepository.updateAll({
    //   status: TaskResultStatus.SUCCESS,
    // });

    return this.taskResultRepository.find({
      where: { status: TaskResultStatus.IN_PROGRESS },
      order: {
        createdAt: 'DESC',
      },
      relations: ['task', 'taskRun'],
    });
  }

  async getAllQueued(): Promise<TaskResult[]> {
    const jobs = await this.taskQueue.getWaiting();
    console.log(jobs);
    const taskResultIds = jobs.map(
      (job: { data: { taskResultId: string } }) => job?.data?.taskResultId,
    );
    console.log(taskResultIds);

    // Fetch TaskResult entities from the database
    if (taskResultIds.length === 0) return [];

    const foundResults = await this.taskResultRepository.findBy({
      id: In(taskResultIds),
    });

    console.log(foundResults);

    return foundResults;
  }
  getCurrentTaskResults(taskResultId: string): Observable<ActivityDto> {
    return this.getTaskResultSubject(taskResultId).asObservable();
  }

  /**
   * Returns an observable to track queue events.
   */
  trackQueue(): Observable<QueueDto> {
    return this.queueSubject.asObservable();
  }

  /**
   * Emits a queue event to all subscribers.
   */
  emitQueueEvent(event: QueueDto) {
    // TODO: fix json.stringify
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.queueSubject.next(JSON.stringify(event));
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
      // TODO: fix json.stringify
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      stream.next(JSON.stringify(data));
    }
    // todo: if task result is done, clean up the stream
  }
}
