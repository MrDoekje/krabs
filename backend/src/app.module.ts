import { Module } from '@nestjs/common';
import { TaskModule } from './task/task.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CommandModule } from 'src/command/command.module';
import { TaskRunModule } from 'src/task/task-run/task-run.module';
import { ArgumentModule } from 'src/argument/argument.module';
import { CliModule } from 'src/cli/cli-module';
import { ActivityModule } from 'src/activity/activity.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TaskResultOutputModule } from 'src/task/task-result/task-result-output/task-result-output.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: './data/krabs',
      autoLoadEntities: true,
      synchronize: true,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    EventEmitterModule.forRoot(),
    CommandModule,
    TaskRunModule,
    ArgumentModule,
    TaskModule,
    CliModule,
    ActivityModule,
    TaskResultOutputModule,
  ],
})
export class AppModule {}
