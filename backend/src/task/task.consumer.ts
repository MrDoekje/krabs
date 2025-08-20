import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TaskService } from 'src/task/task.service';

@Processor('task', { concurrency: 2 })
export class TaskConsumer extends WorkerHost {
  private readonly logger = new Logger(TaskConsumer.name);

  constructor(private readonly taskService: TaskService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'execute-task':
        return this.handleExecuteTask(job);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleExecuteTask(
    job: Job<{
      // Move to DTO
      taskId: string;
      commandArguments: Record<string, Record<string, string>>;
      saveAsRun?: boolean;
      taskResultId?: string;
    }>,
  ) {
    const { taskId, commandArguments, saveAsRun, taskResultId } = job.data;

    this.logger.log(`Executing task ${taskId} from queue`);

    try {
      const task = await this.taskService.findById(taskId);
      const results = await this.taskService.executeTask(
        task,
        commandArguments,
        saveAsRun,
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
