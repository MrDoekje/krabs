import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskResultOutputService } from 'src/task/task-result/task-result-output/task-result-output.service';
import { TaskResultOutput } from 'src/task/task-result/task-result-output/entities/task-result-output.entity';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TaskResultOutputConsumer } from 'src/task/task-result/task-result-output/task-result-output.consumer';
import { TaskResultOutputController } from 'src/task/task-result/task-result-output/task-result-output.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskResultOutput, TaskResult]),
    EventEmitterModule.forRoot(),
  ],
  providers: [TaskResultOutputService, TaskResultOutputConsumer],
  exports: [TaskResultOutputService],
  controllers: [TaskResultOutputController],
})
export class TaskResultOutputModule {}
