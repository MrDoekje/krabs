import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { Task } from 'src/task/entities/task.entity';

@Injectable()
export class TaskResultService {
  constructor(
    @InjectRepository(TaskResult)
    private readonly taskResultRepository: Repository<TaskResult>,
  ) {}

  /**
   * Save a new task result
   */
  async saveTaskResult(
    task: Task,
    overallSuccess: boolean,
    errorMessage: string | null,
    commandResults: any,
  ): Promise<TaskResult> {
    const taskResult = new TaskResult();
    taskResult.task = task;
    taskResult.success = overallSuccess;
    taskResult.error = errorMessage;
    taskResult.output = JSON.stringify(commandResults);

    return await this.taskResultRepository.save(taskResult);
  }

  /**
   * Get task results by task name
   */
  async getResultsByTaskName(taskName: string): Promise<TaskResult[]> {
    const tasks = await this.taskResultRepository.find({
      where: { task: { name: taskName } },
      relations: ['task'],
    });
    return tasks || [];
  }
}
