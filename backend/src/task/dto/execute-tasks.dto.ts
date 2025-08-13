import { IsObject, IsOptional } from 'class-validator';

export class ExecuteTaskDto {
  /**
   * Arguments per named command (per named argument)
   */
  @IsObject()
  @IsOptional()
  commandArguments?: Record<string, any>;
}
