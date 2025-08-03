import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskRun } from 'src/task/task-run/entities/task-run.entity';
import { TaskRunService } from 'src/task/task-run/task-run.service';
import { TaskRunController } from 'src/task/task-run/task-run.controller';
import { TaskModule } from 'src/task/task.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskRun]), forwardRef(() => TaskModule)],
  controllers: [TaskRunController],
  providers: [TaskRunService],
  exports: [TaskRunService],
})
export class TaskRunModule {}
