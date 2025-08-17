import { Injectable } from '@nestjs/common';
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

  /**
   * Save a new task result
   */
  async saveTaskResult(
    task: Task,
    overallSuccess: boolean,
    commandResults: CommandResultDto[],
  ): Promise<TaskResult> {
    const taskResult = new TaskResult();
    taskResult.task = task;
    taskResult.status = overallSuccess
      ? TaskResultStatus.SUCCESS
      : TaskResultStatus.FAILED;
    taskResult.output = JSON.stringify(commandResults);

    return await this.taskResultRepository.save(taskResult);
  }

  /**
  //  TODO: make it by id instead, and add pagination
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
