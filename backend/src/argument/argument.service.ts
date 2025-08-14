import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Argument } from './entities/argument.entity';
import { CreateArgumentDto } from './dto/create-argument.dto';

@Injectable()
export class ArgumentService {
  constructor(
    @InjectRepository(Argument)
    private readonly argumentRepository: Repository<Argument>,
  ) {}

  async create(dto: CreateArgumentDto): Promise<Argument> {
    const argument = this.argumentRepository.create(dto);
    return this.argumentRepository.save(argument);
  }

  async update(id: number, dto: Partial<CreateArgumentDto>): Promise<Argument> {
    const argument = await this.argumentRepository.findOne({ where: { id } });
    if (!argument) {
      throw new NotFoundException(`Argument with ID ${id} not found`);
    }
    Object.assign(argument, dto);
    return this.argumentRepository.save(argument);
  }
}
