import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { Task } from 'src/task/entities/task.entity';
import { TaskResultStatus } from 'src/task/task-result/types';
import { CommandResultDto } from 'src/command/dto/command-result.dto';

@Injectable()
export class TaskResultService {
  constructor(
    @InjectRepository(TaskResult)
    private readonly taskResultRepository: Repository<TaskResult>,
  ) {}

  async createTaskResult(task: Task): Promise<TaskResult> {
    const taskResult = new TaskResult();
    taskResult.task = task;

    return await this.taskResultRepository.save(taskResult);
  }

  /**
   * Save a new task result
   */
  async saveTaskResult(
    taskResultId: string,
    overallSuccess: boolean,
    commandResults: CommandResultDto[],
  ): Promise<TaskResult> {
    const task = await this.taskResultRepository.findOne({
      where: { id: taskResultId },
    });

    if (!task) {
      throw new NotFoundException(
        `TaskResult with ID ${taskResultId} not found`,
      );
    }

    task.status = overallSuccess
      ? TaskResultStatus.SUCCESS
      : TaskResultStatus.FAILED;
    task.output = JSON.stringify(commandResults);

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
