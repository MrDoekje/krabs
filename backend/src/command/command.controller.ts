import { CreateCommandDto } from './dto/create-command.dto';
import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { Command } from './entities/command.entity';
import { CommandService } from './command.service';

@Controller('commands')
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  // @Get()
  // findAll(): Command[] {
  //   throw new NotImplementedException('This method is not implemented yet');
  // }

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
    @Body() updateCommandDto: CreateCommandDto,
  ): Promise<Command> {
    return await this.commandService.update(id, updateCommandDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string): { deleted: boolean } {
  //   throw new NotImplementedException('This method is not implemented yet');
  // }
}
