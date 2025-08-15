import { Module } from '@nestjs/common';
import { ArgumentController } from 'src/argument/argument.controller';
import { ArgumentService } from 'src/argument/argument.service';
import { Argument } from 'src/argument/entities/argument.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Command } from 'src/command/entities/command.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Argument, Command])],
  controllers: [ArgumentController],
  providers: [ArgumentService],
  exports: [ArgumentService],
})
export class ArgumentModule {
  constructor() {}
}
