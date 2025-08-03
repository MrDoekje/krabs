import { Module } from '@nestjs/common';
import { TaskModule } from './task/task.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CommandModule } from 'src/command/command.module';
import { TaskRunModule } from 'src/task/task-run/task-run.module';

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
    CommandModule,
    TaskRunModule,
    // ArgumentModule,
    TaskModule,
  ],
})
export class AppModule {}
