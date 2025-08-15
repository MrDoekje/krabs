import { Argument } from 'src/argument/entities/argument.entity';
import { Controller, Post, Put, Param, Body, Delete } from '@nestjs/common';
import { CreateArgumentDto } from 'src/argument/dto/create-argument.dto';
import { UpdateArgumentDto } from 'src/argument/dto/update-argument.dto';
import { ArgumentService } from 'src/argument/argument.service';

@Controller('arguments')
export class ArgumentController {
  constructor(private readonly argumentService: ArgumentService) {}

  // @Get()
  // findAll(): Promise<Argument[]> {
  //   throw new NotImplementedException('This method is not implemented yet');
  // }

  // @Get(':id')
  // findOne(@Param('id') id: number): Promise<Argument> {
  //   throw new NotImplementedException('This method is not implemented yet');
  // }

  @Post()
  create(@Body() data: CreateArgumentDto): Promise<Argument> {
    return this.argumentService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() data: UpdateArgumentDto,
  ): Promise<Argument> {
    return this.argumentService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.argumentService.remove(id);
  }
}
