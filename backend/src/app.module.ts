import { Module } from '@nestjs/common';
import { TaskModule } from './task/task.module';
import { ExecutorModule } from './executor/executor.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

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
    ExecutorModule,
    TaskModule,
    // CommandModule,
    // ArgumentModule,
  ],
})
export class AppModule {}
