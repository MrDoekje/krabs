import { IsNumber, IsOptional } from 'class-validator';
import { ExecuteTaskDto } from './execute-tasks.dto';

export class QueueTaskDto extends ExecuteTaskDto {
  /**
   * Arguments per named command (per named argument)
   */
  @IsNumber()
  @IsOptional()
  priority?: number;
}
