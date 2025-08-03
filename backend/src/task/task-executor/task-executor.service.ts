import { Injectable, Logger } from '@nestjs/common';
import { Task } from 'src/task/entities/task.entity';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { CommandResultDto } from 'src/command/dto/command-result.dto';
import { TaskRunService } from '../task-run/task-run.service';
import { TaskResultService } from '../task-result/task-result.service';
import { CommandService } from 'src/command/command.service';

@Injectable()
export class TaskExecutorService {
  private readonly logger = new Logger(TaskExecutorService.name);

  constructor(
    private readonly taskRunService: TaskRunService,
    private readonly taskResultService: TaskResultService,
    private readonly commandService: CommandService,
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
    let errorMessage: string | null = null;

    if (saveAsRun) {
      // TODO: maybe remove if not succesful, or add result
      await this.taskRunService.create({
        name: `${task.name} - ${new Date().toISOString()}`,
        description: `Run for task ${task.name}`,
        task,
        commandArguments,
      });
    }

    for (const taskCommand of task.taskCommands) {
      const command = taskCommand.command;

      if (!shouldContinue && !command.optional) {
        this.logger.warn(
          `Skipping command ${command.command} due to previous failure`,
        );
        continue;
      }

      try {
        const result = await this.commandService.executeCommand(
          command,
          commandArguments,
        );
        commandResults.push(result);

        if (!result.success && !command.optional) {
          shouldContinue = false;
          overallSuccess = false;
          errorMessage = result.error || `Command ${command.command} failed`;
          this.logger.warn(
            `Command ${command.command} failed, stopping execution`,
          );
        }
      } catch (error) {
        this.logger.error(`Error executing command ${command.command}:`, error);

        commandResults.push({
          success: false,
          output: '',
          error: error instanceof Error ? error.message : String(error),
        });

        overallSuccess = false;
        errorMessage = error instanceof Error ? error.message : String(error);

        if (!command.optional) {
          shouldContinue = false;
        }
      }
    }

    const savedTaskResult = await this.taskResultService.saveTaskResult(
      task,
      overallSuccess,
      errorMessage,
      commandResults,
    );

    this.logger.log(
      `Task ${task.name} execution completed with ${commandResults.length} command results`,
    );
    return savedTaskResult;
  }
}
