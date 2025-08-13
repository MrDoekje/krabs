import { Module } from '@nestjs/common';
import { ActivityController } from 'src/activity/activity.controller';

@Module({
  controllers: [ActivityController],
})
export class ActivityModule {}
