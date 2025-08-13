import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Argument } from 'src/argument/entities/argument.entity';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { CreateArgumentDto } from 'src/argument/dto/create-argument.dto';
import { UpdateArgumentDto } from 'src/argument/dto/update-argument.dto';

@Controller('arguments')
export class ArgumentController {
  constructor() {}

  @Get()
  findAll(): Promise<Argument[]> {
    throw new NotImplementedException('This method is not implemented yet');
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Argument> {
    throw new NotImplementedException('This method is not implemented yet');
  }

  @Post()
  create(@Body() data: CreateArgumentDto): Promise<Argument> {
    throw new NotImplementedException('This method is not implemented yet');
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() data: UpdateArgumentDto,
  ): Promise<Argument> {
    throw new NotImplementedException('This method is not implemented yet');
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    throw new NotImplementedException('This method is not implemented yet');
  }
}
