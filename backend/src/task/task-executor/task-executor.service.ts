import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Task } from 'src/task/entities/task.entity';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { TaskRunService } from 'src/task/task-run/task-run.service';
import { TaskResultService } from 'src/task/task-result/task-result.service';
import { CommandService } from 'src/command/command.service';
import { ActivityService } from 'src/activity/activity.service';
import { TaskResultStatus } from '../task-result/types';

@Injectable()
export class TaskExecutorService {
  private readonly logger = new Logger(TaskExecutorService.name);

  constructor(
    private readonly taskRunService: TaskRunService,
    private readonly taskResultService: TaskResultService,
    private readonly commandService: CommandService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Execute a task with provided arguments
   */
  async executeTask(
    task: Task,
    taskRunId: string,
    taskResultId?: string,
  ): Promise<TaskResult> {
    this.logger.log(
      `Executing task ${task.name} with ${task.taskCommands.length} commands`,
    );

    let shouldContinue = true;
    let overallSuccess = true;

    const taskRun = await this.taskRunService.findById(taskRunId);

    if (taskRun === null) {
      throw new NotFoundException(`TaskRun with ID ${taskRunId} not found`);
    }

    let taskResult: TaskResult;

    if (!taskResultId) {
      taskResult = await this.taskResultService.createTaskResult(
        task,
        taskRun,
        taskResultId,
      );
    } else {
      taskResult =
        await this.taskResultService.getResultsByTaskResultId(taskResultId);
    }

    await this.taskResultService.updateTaskResultStatus(
      taskResult.id,
      TaskResultStatus.IN_PROGRESS,
    );

    this.activityService.emitQueueEvent({
      taskResultId: taskResult.id,
      event: 'started',
      timestamp: Date.now(),
      taskId: task.id,
    });

    for (const taskCommand of task.taskCommands) {
      const command = taskCommand.command;

      if (!shouldContinue && !command.optional) {
        this.logger.warn(
          `Skipping command ${command.command} due to previous failure`,
        );
        break;
      }

      try {
        const result = await this.commandService.executeCommand(
          taskResult.id,
          command,
          taskRun.commandArguments,
        );

        if (result.success) {
          this.logger.log(
            `Command ${command.command} was executed successfully`,
          );
          continue;
        }

        this.logger.warn(
          `Command ${command.command} was not executed successfully`,
        );

        if (!command.optional) {
          shouldContinue = false;
          overallSuccess = false;
        }
      } catch (error) {
        this.logger.error(`Error executing command ${command.command}:`, error);

        overallSuccess = false;

        if (!command.optional) {
          shouldContinue = false;
        }
      }
    }

    const savedTaskResult = await this.taskResultService.updateTaskResultStatus(
      taskResult.id,
      overallSuccess ? TaskResultStatus.SUCCESS : TaskResultStatus.FAILED,
    );

    this.activityService.emitQueueEvent({
      taskResultId: taskResult.id,
      event: 'ended',
      timestamp: Date.now(),
      taskId: task.id,
    });

    this.logger.log(`Task ${task.name} execution completed`);
    return savedTaskResult;
  }
}
