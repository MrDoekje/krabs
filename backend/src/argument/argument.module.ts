import { Module } from '@nestjs/common';
import { ArgumentController } from 'src/argument/argument.controller';

@Module({
  controllers: [ArgumentController],
  providers: [],
  exports: [],
})
export class ArgumentModule {}
