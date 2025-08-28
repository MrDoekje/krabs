import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { ActivityService } from 'src/activity/activity.service';
import { TaskService } from 'src/task/task.service';
import { TaskResult } from './task-result/entities/task-result.entity';
import { In, Not, Repository } from 'typeorm';
import { TaskResultStatus } from './task-result/types';

@Processor('task', { concurrency: 3 })
export class TaskConsumer extends WorkerHost {
  private readonly logger = new Logger(TaskConsumer.name);

  constructor(
    private readonly taskService: TaskService,
    private readonly activityService: ActivityService,
    @InjectRepository(TaskResult)
    private readonly taskResultRepository: Repository<TaskResult>,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('TaskConsumer initialized, pruning stale task results');
    const activeTaskResults = await this.activityService.getAllActiveInQueue();
    const queuedTasksResults = await this.activityService.getAllQueued();
    const updatedResults = await this.taskResultRepository.update(
      {
        id: Not(
          In([
            ...queuedTasksResults.map((task) => task.id),
            ...activeTaskResults.map((task) => task.id),
          ]),
        ),
        status: In([TaskResultStatus.IN_PROGRESS, TaskResultStatus.QUEUED]),
      },
      {
        status: TaskResultStatus.STOPPED,
      },
    );
    this.logger.log(`Pruned ${updatedResults.affected} stale task results`);
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'execute-task':
        return await this.handleExecuteTask(job);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleExecuteTask(
    job: Job<{
      // TODO: move to DTO
      taskId: string;
      taskRunId: string;
      taskResultId?: string;
    }>,
  ) {
    const { taskId, taskRunId, taskResultId } = job.data;

    this.logger.log(`Executing task ${taskId} from queue`);

    try {
      const task = await this.taskService.findById(taskId);
      const results = await this.taskService.executeTask(
        task,
        { taskRunId },
        taskResultId,
      );

      this.logger.log(`Task ${taskId} completed with`);
      return { success: true, results };
    } catch (error) {
      this.logger.error(`Task ${taskId} failed:`, error);
      throw error;
    }
  }
}
