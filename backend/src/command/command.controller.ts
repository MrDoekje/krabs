import { CreateCommandDto } from 'src/command/dto/create-command.dto';
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { Command } from 'src/command/entities/command.entity';
import { CommandService } from 'src/command/command.service';
import { UpdateCommandDto } from './dto/update-command.dto';
import { MostPopularFormatDto } from './dto/most-popular-formats.dto';

@Controller('commands')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  @Get()
  findAll(): Promise<Command[]> {
    return this.commandService.findAll();
  }

  @Get('formats')
  async getMostPopularFormats(): Promise<MostPopularFormatDto[]> {
    return this.commandService.getMostPopularFormats();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Command> {
    return this.commandService.findOne(id);
  }

  @Post()
  async create(@Body() createCommandDto: CreateCommandDto): Promise<Command> {
    return await this.commandService.create(createCommandDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommandDto: UpdateCommandDto,
  ): Promise<Command> {
    return await this.commandService.update(id, updateCommandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.commandService.remove(id);
  }
}
