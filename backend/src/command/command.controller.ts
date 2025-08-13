import { CreateCommandDto } from './dto/create-command.dto';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotImplementedException,
} from '@nestjs/common';
import { Command } from './entities/command.entity';

@Controller('commands')
export class CommandController {
  @Get()
  findAll(): Command[] {
    throw new NotImplementedException('This method is not implemented yet');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Command {
    throw new NotImplementedException('This method is not implemented yet');
  }

  @Post()
  create(@Body() createCommandDto: CreateCommandDto): Command {
    throw new NotImplementedException('This method is not implemented yet');
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommandDto: CreateCommandDto,
  ): Command {
    throw new NotImplementedException('This method is not implemented yet');
  }

  @Delete(':id')
  remove(@Param('id') id: string): { deleted: boolean } {
    throw new NotImplementedException('This method is not implemented yet');
  }
}
