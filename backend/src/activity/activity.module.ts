import { Module } from '@nestjs/common';
import { ActivityController } from 'src/activity/activity.controller';
import { ActivityService } from 'src/activity/activity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskResult])],
  providers: [ActivityService],
  exports: [ActivityService],
  controllers: [ActivityController],
})
export class ActivityModule {}
