import {
  IsString,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCommandDto } from 'src/command/dto/create-command.dto';

export class CreateTaskDto {
  /**
   * The name of the task.
   * @type {string}
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * An optional description of the task.
   * @type {string}
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * The list of commands associated with the task
   * @type {CommandDto[]}
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCommandDto)
  @IsOptional()
  commands?: CreateCommandDto[];

  // TODO: also allow running the task when creating it

  // TODO:
  // recurring
}
