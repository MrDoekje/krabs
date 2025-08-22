import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskResultOutput } from 'src/task/task-result/task-result-output/entities/task-result-output.entity';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';

@Injectable()
export class TaskResultOutputService {
  constructor(
    @InjectRepository(TaskResultOutput)
    private readonly outputRepository: Repository<TaskResultOutput>,
    @InjectRepository(TaskResult)
    private readonly taskResultRepository: Repository<TaskResult>,
  ) {}

  async createForTaskResult(
    taskResultId: string,
    outputData: string,
  ): Promise<TaskResultOutput> {
    const taskResult = await this.taskResultRepository.findOne({
      where: { id: taskResultId },
    });

    if (!taskResult) {
      throw new Error(`TaskResult with ID ${taskResultId} not found`);
    }

    const output = this.outputRepository.create({
      taskResult,
      line: outputData,
    });
    return this.outputRepository.save(output);
  }

  async findAll(taskResultId: string): Promise<TaskResultOutput[]> {
    return this.outputRepository.find({
      where: { taskResult: { id: taskResultId } },
      relations: ['taskResult'],
    });
  }
}
