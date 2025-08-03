import { IsBoolean, IsOptional } from 'class-validator';

export class ExecuteTaskRunDto {
  /**
   * Whether the task should be queued or executed immediately.
   * @type {boolean}
   * @default false
   */
  @IsBoolean()
  @IsOptional()
  queued?: boolean = false;
}
