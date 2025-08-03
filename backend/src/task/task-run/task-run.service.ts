import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { TaskService } from 'src/task/task.service';
import { TaskRun } from 'src/task/task-run/entities/task-run.entity';
import { Task } from 'src/task/entities/task.entity';
import type { WrapperType } from 'src/utils/wrapper';

@Injectable()
export class TaskRunService {
  private readonly logger = new Logger(TaskRunService.name);

  constructor(
    @InjectRepository(TaskRun)
    private readonly taskRunRepository: Repository<TaskRun>,
    @Inject(forwardRef(() => TaskService))
    private taskService: WrapperType<TaskService>,
  ) {}

  /**
   * Create a new task run configuration
   */
  async create(createTaskRun: {
    name: string;
    description?: string;
    task: Task;
    commandArguments: Record<string, Record<string, string>>;
    favorited?: boolean;
  }): Promise<TaskRun> {
    this.logger.log(`Creating task run configuration: ${createTaskRun.name}`);
    const taskRun = new TaskRun();
    taskRun.name = createTaskRun.name;
    taskRun.description = createTaskRun.description;
    taskRun.task = createTaskRun.task;
    taskRun.commandArguments = createTaskRun.commandArguments;
    taskRun.favorited = createTaskRun.favorited ?? false;

    const savedTaskRun = await this.taskRunRepository.save(taskRun);
    this.logger.log(
      `Task run configuration created successfully with ID: ${savedTaskRun.id}`,
    );

    return savedTaskRun;
  }

  /**
   * Find a task run configuration by ID
   */
  async findById(id: string): Promise<TaskRun> {
    const taskRun = await this.taskRunRepository.findOne({
      where: { id },
    });

    if (!taskRun) {
      throw new NotFoundException(
        `Task run configuration with ID "${id}" not found`,
      );
    }

    return taskRun;
  }

  /**
   * Execute a task using a task run configuration
   */
  async execute(taskRunId: string, queued = false): Promise<void | TaskResult> {
    this.logger.log(`Executing task run configuration: ${taskRunId}`);

    const taskRun = await this.findById(taskRunId);

    // Increment usage count
    taskRun.usageCount += 1;
    await this.taskRunRepository.save(taskRun);

    this.logger.log(
      `Task run ${taskRun.name} usage count incremented to ${taskRun.usageCount}`,
    );

    // Execute the task with the stored arguments
    if (queued) {
      await this.taskService.queueByName(
        taskRun.task.name,
        taskRun.commandArguments,
      );
      this.logger.log(
        `Task ${taskRun.task.name} queued with task run configuration ${taskRun.name} (${taskRun.id})`,
      );
    } else {
      const result = await this.executeByName(
        taskRun.task.name,
        taskRun.commandArguments,
      );
      this.logger.log(
        `Task ${taskRun.task.name} executed with task run configuration ${taskRun.name} (${taskRun.id})`,
      );
      return result;
    }
  }

  /**
   * Execute a task immediately by name with supplied arguments and return result
   */
  async executeByName(
    taskName: string,
    commandArguments: Record<string, Record<string, string>> = {},
  ): Promise<TaskResult> {
    this.logger.log(`Executing task: ${taskName}`);

    const task = await this.taskService.findByName(taskName);
    return this.taskService.executeTask(task, commandArguments);
  }

  /**
   * Get all task run configurations
   */
  async findAll(): Promise<TaskRun[]> {
    return this.taskRunRepository.find({
      relations: ['task'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all favorited task run configurations
   */
  async findFavorited(): Promise<TaskRun[]> {
    return this.taskRunRepository.find({
      where: { favorited: true },
      relations: ['task'],
      order: { usageCount: 'DESC' },
    });
  }

  /**
   * Toggle favorite status of a task run configuration
   */
  async toggleFavorite(taskRunId: string): Promise<TaskRun> {
    const taskRun = await this.findById(taskRunId);
    taskRun.favorited = !taskRun.favorited;

    const updatedTaskRun = await this.taskRunRepository.save(taskRun);
    this.logger.log(
      `Task run ${taskRun.name} favorite status set to ${updatedTaskRun.favorited}`,
    );

    return updatedTaskRun;
  }
}
