import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateArgumentDto {
  /**
   * The name of the argument.
   */
  @IsString()
  name: string;

  /**
   * Indicates if the argument is required.
   */
  @IsBoolean()
  required: boolean;

  /**
   * The ID of the command this argument belongs to (optional).
   */
  @IsOptional()
  @IsString()
  commandId?: string;
}
