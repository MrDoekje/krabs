import { IsString, IsOptional, IsObject } from 'class-validator';
import type { CommandArguments } from 'src/helpers/runOrArgument';

export class UpdateTaskRunDto {
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Arguments per named command (per named argument)
   */
  @IsObject()
  @IsOptional()
  commandArguments?: CommandArguments;
}
