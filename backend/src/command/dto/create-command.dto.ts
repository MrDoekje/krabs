import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateArgumentDto } from 'src/argument/dto/create-argument.dto';

export class CreateCommandDto {
  /**
   * The working directory for the command.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty()
  wd: string;

  /**
   * The command to be executed, for now including arguments
   * @type {string}
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The command to be executed, for now including arguments
   * @type {string}
   */
  @IsString()
  @IsNotEmpty()
  command: string;

  /**
   * Optional flag to indicate if the command is optional, if so it will not block the task on fail.
   * @type {boolean}
   * @default false
   */
  @IsBoolean()
  @IsOptional()
  optional?: boolean;

  /**
   * The format for the command arguments.
   * This is used to format the arguments when they are passed to the command.
   * @type {string}
   * @default '--{{name}}={{value}}'
   */
  @IsString()
  format: string = '--{{name}}={{value}}';

  /**
   * The list of arguments for the command.
   * @type {CreateArgumentDto[]}
   */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateArgumentDto)
  arguments?: CreateArgumentDto[];

  /**
   * Optional task ID to associate the command with a specific task.
   * @type {string}
   */
  @IsString()
  @IsOptional()
  taskId?: string;
}
