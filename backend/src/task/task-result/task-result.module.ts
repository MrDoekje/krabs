import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { TaskResultService } from 'src/task/task-result/task-result.service';
import { TaskResultController } from 'src/task/task-result/task-result.controller';
import { TaskResultOutput } from 'src/task/task-result/task-result-output/entities/task-result-output.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskResult, TaskResultOutput])],
  providers: [TaskResultService],
  controllers: [TaskResultController],
  exports: [TaskResultService],
})
export class TaskResultModule {}
