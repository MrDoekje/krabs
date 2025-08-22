import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/**
 * Data Transfer Object representing the result of a command execution.
 */
export class CommandResultDto {
  /**
   * Indicates whether the command executed successfully.
   */
  @ApiProperty({ description: 'Indicates if the command was successful.' })
  @IsBoolean()
  success: boolean;
}
