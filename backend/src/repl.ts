import { repl } from '@nestjs/core';
import { TaskModule } from './task/task.module';

async function bootstrap() {
  await repl(TaskModule);
}
bootstrap();
