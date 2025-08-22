import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { Task } from 'src/task/entities/task.entity';
import { TaskResultStatus } from 'src/task/task-result/types';
import { TaskRun } from 'src/task/task-run/entities/task-run.entity';

@Injectable()
export class TaskResultService {
  constructor(
    @InjectRepository(TaskResult)
    private readonly taskResultRepository: Repository<TaskResult>,
  ) {}

  async createTaskResult(
    task: Task,
    taskRun: TaskRun,
    taskResultId?: string,
  ): Promise<TaskResult> {
    const taskResult = new TaskResult();
    taskResult.task = task;
    taskResult.taskRun = taskRun;

    if (taskResultId) {
      taskResult.id = taskResultId;
    }

    const result = await this.taskResultRepository.save(taskResult);

    return result;
  }

  /**
   * Save a new task result
   */
  async updateTaskResultStatus(
    taskResultId: string,
    status: TaskResultStatus,
  ): Promise<TaskResult> {
    const task = await this.taskResultRepository.findOne({
      where: { id: taskResultId },
    });

    if (!task) {
      throw new NotFoundException(
        `TaskResult with ID ${taskResultId} not found`,
      );
    }

    task.status = status;

    return await this.taskResultRepository.save(task);
  }

  async getResultsByTaskResultId(taskResultId: string): Promise<TaskResult> {
    const taskResult = await this.taskResultRepository.findOne({
      where: { id: taskResultId },
      relations: ['task'],
    });

    if (!taskResult) {
      throw new NotFoundException(
        `TaskResult with ID ${taskResultId} not found`,
      );
    }

    return taskResult;
  }
}
