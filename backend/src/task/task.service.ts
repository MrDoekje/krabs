import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Task } from 'src/task/entities/task.entity';
import { TaskCommand } from 'src/task/task-command/entities/task-command.entity';
import { Command } from 'src/command/entities/command.entity';
import { Argument } from 'src/argument/entities/argument.entity';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { TaskExecutorService } from 'src/task/task-executor/task-executor.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskCommand)
    private readonly taskCommandRepository: Repository<TaskCommand>,
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
    @InjectRepository(Argument)
    private readonly argumentRepository: Repository<Argument>,
    @InjectQueue('task')
    private readonly taskQueue: Queue,
    private readonly taskExecutorService: TaskExecutorService,
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

      // TODO: use transaction to save all at once
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
    return savedTask;
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
    return this.taskExecutorService.executeTask(
      task,
      commandArguments,
      saveAsRun,
    );
  }

  /**
   * Get all tasks
   */
  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  /**
   * Delete a task by name
   */
  async deleteByName(taskName: string): Promise<void> {
    const task = await this.findByName(taskName);
    await this.taskRepository.remove(task);
    this.logger.log(`Task ${taskName} deleted successfully`);
  }
}
