import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { Command } from 'src/command/entities/command.entity';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  /**
   * The list of commands associated with the task
   * @type {CommandDto[]}
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Command)
  @IsOptional()
  commands?: Command[];
}
