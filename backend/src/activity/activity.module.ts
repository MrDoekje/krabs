import { Module } from '@nestjs/common';
import { ActivityController } from 'src/activity/activity.controller';
import { ActivityService } from 'src/activity/activity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskResult } from 'src/task/task-result/entities/task-result.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ActivityConsumer } from 'src/activity/activity.consumer';
import { Task } from 'src/task/entities/task.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskResult, Task]),
    EventEmitterModule.forRoot(),
    BullModule.registerQueue({
      name: 'task',
    }),
  ],
  providers: [ActivityService, ActivityConsumer],
  exports: [ActivityService],
  controllers: [ActivityController],
})
export class ActivityModule {}
