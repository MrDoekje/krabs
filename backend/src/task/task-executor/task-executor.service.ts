import { Injectable, Logger } from '@nestjs/common';
import { Task } from 'src/task/entities/task.entity';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { CommandResultDto } from 'src/command/dto/command-result.dto';
import { TaskRunService } from '../task-run/task-run.service';
import { TaskResultService } from '../task-result/task-result.service';
import { CommandService } from 'src/command/command.service';
import { ActivityService } from 'src/activity/activity.service';

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
    commandArguments: Record<string, Record<string, string>> = {},
    saveAsRun: boolean = false,
  ): Promise<TaskResult> {
    this.logger.log(
      `Executing task ${task.name} with ${task.taskCommands.length} commands`,
    );

    const commandResults: CommandResultDto[] = [];
    let shouldContinue = true;
    let overallSuccess = true;

    const taskResult = await this.taskResultService.createTaskResult(task);

    if (saveAsRun) {
      await this.taskRunService.create({
        name: `${task.name} - ${new Date().toISOString()}`,
        description: `Run for task ${task.name}`,
        task,
        commandArguments,
      });
    }

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
          commandArguments,
        );
        commandResults.push(result);

        if (!result.success && !command.optional) {
          shouldContinue = false;
          overallSuccess = false;
          this.logger.warn(
            `Command ${command.command} failed, stopping execution`,
          );

          commandResults.push({
            success: false,
            output: '',
            error: result.error || `Command ${command.command} failed`,
          });
        }
      } catch (error) {
        this.logger.error(`Error executing command ${command.command}:`, error);

        commandResults.push({
          success: false,
          output: '',
          error: error instanceof Error ? error.message : String(error),
        });

        overallSuccess = false;

        if (!command.optional) {
          shouldContinue = false;
        }
      }
    }

    const savedTaskResult = await this.taskResultService.saveTaskResult(
      taskResult.id,
      overallSuccess,
      commandResults,
    );

    this.activityService.emitQueueEvent({
      taskResultId: taskResult.id,
      event: 'ended',
      timestamp: Date.now(),
      taskId: task.id,
    });

    this.logger.log(
      `Task ${task.name} execution completed with ${commandResults.length} command results`,
    );
    return savedTaskResult;
  }
}
