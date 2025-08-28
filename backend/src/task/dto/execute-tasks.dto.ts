import { IsObject, IsOptional } from 'class-validator';
import type { CommandArguments } from 'src/helpers/runOrArgument';

export class ExecuteTaskDto {
  /**
   * Arguments per named command (per named argument)
   */
  @IsObject()
  commandArguments: CommandArguments;
}
