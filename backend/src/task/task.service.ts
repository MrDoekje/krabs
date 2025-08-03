import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Task } from 'src/task/entities/task.entity';
import { TaskCommand } from 'src/task/entities/task-command.entity';
import { TaskRun } from 'src/task/entities/task-run.entity';
import { Command } from 'src/command/entities/command.entity';
import { Argument } from 'src/argument/entities/argument.entity';
import { TaskResult } from 'src/task/entities/task-result.entity';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { ExecutorService } from 'src/executor/executor.service';
import { CommandResultDto } from 'src/executor/dto/command-result.dto';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskCommand)
    private readonly taskCommandRepository: Repository<TaskCommand>,
    @InjectRepository(TaskRun)
    private readonly taskRunRepository: Repository<TaskRun>,
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
    @InjectRepository(Argument)
    private readonly argumentRepository: Repository<Argument>,
    @InjectRepository(TaskResult)
    private readonly taskResultRepository: Repository<TaskResult>,
    @InjectQueue('task')
    private readonly taskQueue: Queue,
    private readonly executorService: ExecutorService,
  ) {}

  /**
   * Create a new task with commands and arguments
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    this.logger.log(`Creating task: ${createTaskDto.name}`);

    const task = new Task();
    task.name = createTaskDto.name;
    task.description = createTaskDto.description;

    // Save the task first to get an ID
    const savedTask = await this.taskRepository.save(task);

    // Create and save commands with their arguments and task relationships
    const commands = createTaskDto.commands || [];
    for (let index = 0; index < commands.length; index++) {
      const commandDto = commands[index];

      const command = new Command();
      command.wd = commandDto.wd;
      command.name = commandDto.name;
      command.format = commandDto.format || '--{{name}}={{value}}';
      command.command = commandDto.command;
      command.optional = commandDto.optional ?? false;
      command.arguments = [];

      // Create and save arguments if provided
      if (commandDto.arguments && commandDto.arguments.length > 0) {
        for (const argDto of commandDto.arguments) {
          const argument = new Argument();
          argument.name = argDto.name;
          argument.required = argDto.required;
          await this.argumentRepository.save(argument);
          command.arguments.push(argument);
        }
      }

      const savedCommand = await this.commandRepository.save(command);

      // Create the TaskCommand relationship with execution order
      const taskCommand = new TaskCommand();
      taskCommand.task = savedTask;
      taskCommand.command = savedCommand;
      taskCommand.executionOrder = index;

      await this.taskCommandRepository.save(taskCommand);
    }

    this.logger.log(`Task created successfully with ID: ${savedTask.id}`);

    // Return the task with all relationships loaded
    return this.findById(savedTask.id);
  }

  /**
   * Find a task by name
   */
  async findByName(name: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { name },
      relations: [
        'taskCommands',
        'taskCommands.command',
        'taskCommands.command.arguments',
        'results',
      ],
      order: { taskCommands: { executionOrder: 'ASC' } },
    });

    if (!task) {
      throw new NotFoundException(`Task with name "${name}" not found`);
    }

    return task;
  }

  /**
   * Find a task by ID
   */
  async findById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'taskCommands',
        'taskCommands.command',
        'taskCommands.command.arguments',
        'results',
      ],
      order: { taskCommands: { executionOrder: 'ASC' } },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  /**
   * Execute a task immediately by name with supplied arguments
   */
  async executeByName(
    taskName: string,
    commandArguments: Record<string, Record<string, string>> = {},
  ): Promise<void> {
    this.logger.log(`Executing task: ${taskName}`);

    const task = await this.findByName(taskName);
    void this.executeTask(task, commandArguments, true);
  }

  /**
   * Queue a task by name with supplied arguments
   */
  async queueByName(
    taskName: string,
    commandArguments: Record<string, Record<string, string>> = {},
    priority = 0,
    saveAsRun = false,
  ): Promise<void> {
    this.logger.log(`Queueing task: ${taskName}`);

    const task = await this.findByName(taskName);

    await this.taskQueue.add(
      'execute-task',
      {
        taskId: task.id,
        commandArguments,
        saveAsRun,
      },
      {
        priority,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    // Update task status to queued
    task.queued = true;
    await this.taskRepository.save(task);

    this.logger.log(`Task ${taskName} queued successfully`);
  }

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
      await this.createTaskRun({
        name: `${task.name} - ${new Date().toISOString()}`,
        description: `Run for task ${task.name}`,
        taskName: task.name,
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
        const result = await this.executeCommand(
          task,
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

    const taskResult = new TaskResult();
    taskResult.task = task;
    taskResult.success = overallSuccess;
    taskResult.error = errorMessage;
    taskResult.output = JSON.stringify(commandResults);

    const savedTaskResult = await this.taskResultRepository.save(taskResult);

    this.logger.log(
      `Task ${task.name} execution completed with ${commandResults.length} command results`,
    );
    return savedTaskResult;
  }

  /**
   * Execute a single command
   */
  private async executeCommand(
    task: Task,
    command: Command,
    commandArguments: Record<string, Record<string, string>>,
  ): Promise<CommandResultDto> {
    this.logger.log(`Executing command: ${command.command} in ${command.wd}`);

    // Build command arguments from provided values and command definition
    const args: string[] = [];
    const commandKey = command.name;
    const providedArgs = commandArguments[commandKey] || {};

    // Add arguments based on command definition
    for (const argument of command.arguments) {
      const argValue = providedArgs[argument.name];

      if (argument.required && !argValue) {
        throw new Error(
          `Required argument "${argument.name}" not provided for command "${command.command}"`,
        );
      }
      // TODO: move handling to exectuor, and allow different formats
      if (argValue) {
        args.push(
          command.format
            .replace('{{name}}', argument.name)
            .replace('{{value}}', argValue),
        );
      }
    }

    // Execute the command using executor service
    return await this.executorService.executeCommand(
      command.command,
      args,
      command.wd,
    );
  }

  /**
   * Get all tasks
   */
  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: [
        'taskCommands',
        'taskCommands.command',
        'taskCommands.command.arguments',
        'results',
      ],
      order: { taskCommands: { executionOrder: 'ASC' } },
    });
  }

  /**
   * Get task results by task name
   */
  async getResultsByTaskName(taskName: string): Promise<TaskResult[]> {
    const task = await this.findByName(taskName);
    return task.results;
  }

  /**
   * Delete a task by name
   */
  async deleteByName(taskName: string): Promise<void> {
    const task = await this.findByName(taskName);
    await this.taskRepository.remove(task);
    this.logger.log(`Task ${taskName} deleted successfully`);
  }

  // TaskRun Configuration Methods

  /**
   * Create a new task run configuration
   */
  private async createTaskRun(createTaskRun: {
    name: string;
    description?: string;
    taskName: string;
    commandArguments: Record<string, Record<string, string>>;
    favorited?: boolean;
  }): Promise<TaskRun> {
    this.logger.log(`Creating task run configuration: ${createTaskRun.name}`);

    // Verify that the task exists
    const task = await this.findByName(createTaskRun.taskName);

    const taskRun = new TaskRun();
    taskRun.name = createTaskRun.name;
    taskRun.description = createTaskRun.description;
    taskRun.task = task;
    taskRun.commandArguments = createTaskRun.commandArguments;
    taskRun.favorited = createTaskRun.favorited ?? false;

    const savedTaskRun = await this.taskRunRepository.save(taskRun);
    this.logger.log(
      `Task run configuration created successfully with ID: ${savedTaskRun.id}`,
    );

    return savedTaskRun;
  }

  /**
   * Find a task run configuration by name
   */
  async findTaskRunByName(name: string): Promise<TaskRun> {
    const taskRun = await this.taskRunRepository.findOne({
      where: { name },
      relations: ['task'],
    });

    if (!taskRun) {
      throw new NotFoundException(
        `Task run configuration with name "${name}" not found`,
      );
    }

    return taskRun;
  }

  /**
   * Execute a task using a task run configuration
   */
  async executeTaskRun(
    taskRunName: string,
    queued = false,
  ): Promise<void | TaskResult> {
    this.logger.log(`Executing task run configuration: ${taskRunName}`);

    const taskRun = await this.findTaskRunByName(taskRunName);

    // Increment usage count
    taskRun.usageCount += 1;
    await this.taskRunRepository.save(taskRun);

    this.logger.log(
      `Task run ${taskRunName} usage count incremented to ${taskRun.usageCount}`,
    );

    // Execute the task with the stored arguments
    if (queued) {
      await this.queueByName(taskRun.task.name, taskRun.commandArguments);
      this.logger.log(
        `Task ${taskRun.task.name} queued with task run configuration ${taskRunName}`,
      );
    } else {
      const result = await this.executeByNameWithResult(
        taskRun.task.name,
        taskRun.commandArguments,
      );
      this.logger.log(
        `Task ${taskRun.task.name} executed with task run configuration ${taskRunName}`,
      );
      return result;
    }
  }

  /**
   * Execute a task immediately by name with supplied arguments and return result
   */
  async executeByNameWithResult(
    taskName: string,
    commandArguments: Record<string, Record<string, string>> = {},
  ): Promise<TaskResult> {
    this.logger.log(`Executing task: ${taskName}`);

    const task = await this.findByName(taskName);
    return this.executeTask(task, commandArguments);
  }

  /**
   * Get all task run configurations
   */
  async findAllTaskRuns(): Promise<TaskRun[]> {
    return this.taskRunRepository.find({
      relations: ['task'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all favorited task run configurations
   */
  async findFavoritedTaskRuns(): Promise<TaskRun[]> {
    return this.taskRunRepository.find({
      where: { favorited: true },
      relations: ['task'],
      order: { usageCount: 'DESC' },
    });
  }

  /**
   * Toggle favorite status of a task run configuration
   */
  async toggleTaskRunFavorite(taskRunName: string): Promise<TaskRun> {
    const taskRun = await this.findTaskRunByName(taskRunName);
    taskRun.favorited = !taskRun.favorited;

    const updatedTaskRun = await this.taskRunRepository.save(taskRun);
    this.logger.log(
      `Task run ${taskRunName} favorite status set to ${updatedTaskRun.favorited}`,
    );

    return updatedTaskRun;
  }
}
