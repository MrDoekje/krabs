import { Module } from '@nestjs/common';
import { CommandService } from 'src/command/command.service';
import { CommandController } from 'src/command/command.controller';

@Module({
  controllers: [CommandController],
  providers: [CommandService],
  exports: [CommandService],
})
export class CommandModule {}
