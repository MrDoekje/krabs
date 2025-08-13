import { CreateCommandDto } from 'src/command/dto/create-command.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateCommandDto extends PartialType(CreateCommandDto) {}
