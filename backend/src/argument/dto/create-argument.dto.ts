import { IsString, IsBoolean } from 'class-validator';

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
}
