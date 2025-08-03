import { Module } from '@nestjs/common';
import { CommandService } from 'src/command/command.service';

@Module({
  controllers: [],
  providers: [CommandService],
  exports: [CommandService],
})
export class CommandModule {}
