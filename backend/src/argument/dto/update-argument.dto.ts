import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateArgumentDto } from 'src/argument/dto/create-argument.dto';

export class UpdateArgumentDto extends PartialType(
  OmitType(CreateArgumentDto, ['commandId'] as const),
) {}
