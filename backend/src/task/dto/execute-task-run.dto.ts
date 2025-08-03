import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class ExecuteTaskRunDto {
  /**
   * The name of the task run configuration to execute.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty()
  taskRunName: string;

  /**
   * Whether the task should be queued or executed immediately.
   * @type {boolean}
   * @default false
   */
  @IsBoolean()
  @IsOptional()
  queued?: boolean = false;
}
