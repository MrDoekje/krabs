import {
  Injectable,
  NotFoundException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Task } from 'src/task/entities/task.entity';
import { TaskCommand } from 'src/task/task-command/entities/task-command.entity';
import { Command } from 'src/command/entities/command.entity';
import { Argument } from 'src/argument/entities/argument.entity';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { TaskExecutorService } from 'src/task/task-executor/task-executor.service';
import { UpdateTaskDto } from 'src/task/dto/update-task.dto';
import { ActivityService } from 'src/activity/activity.service';
import { v4 as uuidv4 } from 'uuid';
import type { WrapperType } from 'src/utils/wrapper';
import { TaskRunService } from './task-run/task-run.service';
import { TaskResultService } from './task-result/task-result.service';
import { isArguments, RunOrArguments } from 'src/helpers/runOrArgument';

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
    private readonly activityService: ActivityService,
    @Inject(forwardRef(() => TaskRunService))
    private readonly taskRunService: WrapperType<TaskRunService>,
    private readonly taskResultService: TaskResultService,
  ) {}

  /**
   * Create a new task with commands and arguments
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    this.logger.log(`Creating task: ${createTaskDto.name}`);
    // TODO: use transaction to save all at once

    const task = new Task();
    task.name = createTaskDto.name;
    task.description = createTaskDto.description;

    // Save the task first to get an ID
    const savedTask = await this.taskRepository.save(task);
    this.logger.log(`Task created successfully with ID: ${savedTask.id}`);

    // Create and save commands with their arguments and task relationships
    const commands = createTaskDto.commands || [];
    for (let index = 0; index < commands.length; index++) {
      const commandDto = commands[index];

      let command: Command;
      if (commandDto.id) {
        const foundCommand = await this.commandRepository.findOne({
          where: { id: commandDto.id },
        });
        if (!foundCommand) {
          throw new NotFoundException(
            `Command with ID "${commandDto.id}" not found`,
          );
        }
        command = foundCommand;
      } else {
        const newCommand = new Command();
        newCommand.wd = commandDto.wd;
        newCommand.name = commandDto.name;
        newCommand.format = commandDto.format || '--{{name}}={{value}}';
        newCommand.command = commandDto.command;
        newCommand.optional = commandDto.optional ?? false;
        newCommand.arguments = [];

        // Create and save arguments if provided
        if (commandDto.arguments && commandDto.arguments.length > 0) {
          for (const argDto of commandDto.arguments) {
            const argument = new Argument();
            argument.name = argDto.name;
            argument.required = argDto.required;
            await this.argumentRepository.save(argument);
            newCommand.arguments.push(argument);
          }
        }

        command = await this.commandRepository.save(newCommand);
        this.logger.log(`Command created successfully with ID: ${command.id}`);
      }

      // Create the TaskCommand relationship with execution order
      const taskCommand = new TaskCommand();
      taskCommand.task = savedTask;
      taskCommand.command = command;
      taskCommand.executionOrder = index;

      await this.taskCommandRepository.save(taskCommand);
      this.logger.log(
        `TaskCommand created successfully for Task ID: ${savedTask.id}`,
      );
    }

    this.logger.log(`Task created successfully with ID: ${savedTask.id}`);
    return savedTask;
  }

  /**
   * Update an existing task by ID
   */
  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    this.logger.log(`Updating task with ID: ${id}`);
    const task = await this.findById(id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    // Update task properties
    if (updateTaskDto.name) {
      task.name = updateTaskDto.name;
    }
    if (updateTaskDto.description) {
      task.description = updateTaskDto.description;
    }

    await this.taskRepository.save(task);
    this.logger.log(`Task updated successfully with ID: ${task.id}`);

    if (updateTaskDto.commands && Array.isArray(updateTaskDto.commands)) {
      // Remove existing TaskCommand relations for this task
      const existingTaskCommands = await this.taskCommandRepository.find({
        where: { task: { id: task.id } },
        relations: ['command'],
      });

      // Map command IDs to their TaskCommand entities
      const commandIdToTaskCommand = new Map(
        existingTaskCommands.map((tc) => [tc.command.id, tc]),
      );

      // Collect command IDs from the new DTO
      const newCommandIds = new Set(
        updateTaskDto.commands.map((cmd) => cmd.id),
      );

      // Find TaskCommands to remove (not present in new DTO)
      const toRemove = existingTaskCommands.filter(
        (tc) => !newCommandIds.has(tc.command.id),
      );
      if (toRemove.length > 0) {
        await this.taskCommandRepository.remove(toRemove);
      }

      // Prepare updates for TaskCommands whose order has changed
      const updates: TaskCommand[] = [];

      for (let i = 0; i < updateTaskDto.commands.length; i++) {
        const commandDto = updateTaskDto.commands[i];
        const taskCommand = commandIdToTaskCommand.get(commandDto.id);
        if (taskCommand && taskCommand.executionOrder !== i) {
          taskCommand.executionOrder = i;
          updates.push(taskCommand);
        }
      }

      if (updates.length > 0) {
        await this.taskCommandRepository.save(updates);
        this.logger.log(
          `TaskCommands updated successfully for Task ID: ${task.id}`,
        );
      }

      // Add new TaskCommands for commands not already present
      for (let i = 0; i < updateTaskDto.commands.length; i++) {
        const commandDto = updateTaskDto.commands[i];
        if (!commandIdToTaskCommand.has(commandDto.id)) {
          // Find the Command entity by id

          const newTaskCommand = new TaskCommand();
          newTaskCommand.task = task;
          newTaskCommand.command = commandDto;
          newTaskCommand.executionOrder = i;
          await this.taskCommandRepository.save(newTaskCommand);
          this.logger.log(
            `TaskCommand created successfully for Task ID: ${task.id}`,
          );
        }
      }
    }

    return task;
  }

  /**
   * TODO: move to task-repl module/service instead
   * Find a task by name
   */
  async findByName(name: string): Promise<Task> {
    this.logger.log(`Finding task with name: ${name}`);
    const task = await this.taskRepository.findOne({
      where: { name },
      relations: [
        'taskCommands',
        'taskCommands.command',
        'taskCommands.command.arguments',
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
    this.logger.log(`Finding task with ID: ${id}`);
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'taskCommands',
        'taskCommands.command',
        'taskCommands.command.arguments',
      ],
      order: { taskCommands: { executionOrder: 'ASC' } },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing task with ID: ${id}`);
    await this.taskRepository.delete(id);
    return;
  }

  /**
   * Execute a task immediately by id with supplied arguments
   */
  async executeById(taskId: string, options: RunOrArguments): Promise<void> {
    this.logger.log(`Executing task: ${taskId}`);

    const task = await this.findById(taskId);
    void this.executeTask(task, options);
  }

  /**
   * TODO: move to task-repl module/service instead
   * Execute a task immediately by name with supplied arguments
   */
  async executeByName(
    taskName: string,
    options: RunOrArguments,
  ): Promise<void> {
    this.logger.log(`Executing task: ${taskName}`);

    const task = await this.findByName(taskName);
    void this.executeTask(task, options);
  }

  private async queueTask(task: Task, options: RunOrArguments, _priority = 0) {
    const taskResultId = uuidv4();

    let taskRunIdForJob: string;

    if (isArguments(options)) {
      taskRunIdForJob = (
        await this.taskRunService.create({
          name: `${task.name} - ${new Date().toISOString()}`,
          description: `Run for task ${task.name}`,
          task,
          commandArguments: options.commandArguments,
        })
      ).id;
    } else {
      taskRunIdForJob = options.taskRunId;
    }

    await this.taskResultService.createTaskResult(
      task,
      await this.taskRunService.findById(taskRunIdForJob),
      taskResultId,
    );

    this.activityService.emitQueueEvent({
      taskId: task.id,
      taskResultId: taskResultId,
      event: 'queued',
      timestamp: Date.now(),
    });

    await this.taskQueue.add(
      'execute-task',
      // TODO: type this (maybe as a dto? or event dto? or bull interface)
      {
        taskId: task.id,
        taskResultId: taskResultId,
        taskRunId: taskRunIdForJob,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
        // priority,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );
  }

  /**
   * Queue a task by id with supplied arguments
   */
  async queueById(
    taskId: string,
    options: RunOrArguments,
    priority = 0,
  ): Promise<void> {
    this.logger.log(`Queueing task: ${taskId}`);

    const task = await this.findById(taskId);

    await this.queueTask(task, options, priority);

    this.logger.log(`Task ${taskId} queued successfully`);
  }

  /**
   * TODO: move to task-repl module/service instead
   * Queue a task by name with supplied arguments
   */
  async queueByName(
    taskName: string,
    options: RunOrArguments,
    priority = 0,
  ): Promise<void> {
    this.logger.log(`Queueing task: ${taskName}`);

    const task = await this.findByName(taskName);

    await this.queueTask(task, options, priority);

    this.logger.log(`Task ${taskName} queued successfully`);
  }

  async executeTask(
    task: Task,
    options: RunOrArguments,
    taskResultId?: string,
  ) {
    this.logger.log(`Executing task ${task.name} with options:`, options);
    let taskRunId: string;
    if (isArguments(options)) {
      taskRunId = (
        await this.taskRunService.create({
          name: `${task.name} - ${new Date().toISOString()}`,
          description: `Run for task ${task.name}`,
          task,
          commandArguments: options.commandArguments || {},
        })
      ).id;
    } else {
      taskRunId = options.taskRunId;
    }
    return this.taskExecutorService.executeTask(task, taskRunId, taskResultId);
  }

  /**
   * Get all tasks
   */
  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  /**
   * Delete a task by id
   */
  async deleteById(taskId: string): Promise<void> {
    const task = await this.findById(taskId);
    await this.taskRepository.remove(task);
    this.logger.log(`Task ${taskId} deleted successfully`);
  }

  /**
   * TODO: move to task-repl module/service instead
   * Delete a task by name
   */
  async deleteByName(taskName: string): Promise<void> {
    const task = await this.findByName(taskName);
    await this.taskRepository.remove(task);
    this.logger.log(`Task ${taskName} deleted successfully`);
  }
}
