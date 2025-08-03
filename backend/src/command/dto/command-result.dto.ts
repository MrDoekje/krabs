import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

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

  /**
   * The standard output produced by the command.
   */
  @ApiProperty({ description: 'Standard output from the command.' })
  @IsString()
  output: string;

  /**
   * The error output or message if the command failed.
   */
  @ApiProperty({
    description: 'Error output or message if the command failed.',
    required: false,
  })
  @IsOptional()
  @IsString()
  error?: string;
}
