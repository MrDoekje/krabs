import { CreateCommandDto } from 'src/command/dto/create-command.dto';
import { PartialType, OmitType } from '@nestjs/swagger';
import { Argument } from 'src/argument/entities/argument.entity';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCommandDto extends PartialType(
  OmitType(CreateCommandDto, ['taskId']),
) {
  /**
   * The list of arguments for the command.
   * @type {Argument[]}
   */
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Argument)
  arguments?: Argument[];
}
