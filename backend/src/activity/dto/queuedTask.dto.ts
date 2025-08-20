import { Task } from 'src/task/entities/task.entity';
import { IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class QueuedTaskDto extends PartialType(Task) {
  @IsUUID()
  taskResultId: string;
}
