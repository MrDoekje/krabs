import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Argument } from 'src/argument/entities/argument.entity';
import { CreateArgumentDto } from 'src/argument/dto/create-argument.dto';
import { Command } from 'src/command/entities/command.entity';

@Injectable()
export class ArgumentService {
  constructor(
    @InjectRepository(Argument)
    private readonly argumentRepository: Repository<Argument>,
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
  ) {}

  async create(dto: CreateArgumentDto): Promise<Argument> {
    const argument = this.argumentRepository.create({
      ...dto,
    });
    const savedArgument = await this.argumentRepository.save(argument);

    // 2. Check if a commandId was provided
    if (dto.commandId) {
      // 3. Find the command or throw an error
      const command = await this.commandRepository.findOneBy({
        id: dto.commandId,
      });
      if (!command) {
        throw new NotFoundException(
          `Command with ID "${dto.commandId}" not found.`,
        );
      }
      command.arguments.push(savedArgument);
      await this.commandRepository.save(command);
    }

    return savedArgument;
  }

  async update(id: number, dto: Partial<CreateArgumentDto>): Promise<Argument> {
    const argument = await this.argumentRepository.findOne({ where: { id } });
    if (!argument) {
      throw new NotFoundException(`Argument with ID ${id} not found`);
    }
    Object.assign(argument, dto);
    return this.argumentRepository.save(argument);
  }

  async remove(id: number): Promise<void> {
    const argument = await this.argumentRepository.findOne({ where: { id } });
    if (!argument) {
      throw new NotFoundException(`Argument with ID ${id} not found`);
    }
    await this.argumentRepository.remove(argument);
  }
}
