import { Module } from '@nestjs/common';
import { ExecutorService } from 'src/executor/executor.service';

@Module({
  providers: [ExecutorService],
  exports: [ExecutorService],
})
export class ExecutorModule {}
