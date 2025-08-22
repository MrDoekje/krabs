import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandOutputEvent } from 'src/command/event/command-output.event';
import { TaskResultOutputService } from 'src/task/task-result/task-result-output/task-result-output.service';

@Injectable()
export class TaskResultOutputConsumer {
  private readonly logger = new Logger(TaskResultOutputConsumer.name);

  constructor(
    private readonly taskResultOutputService: TaskResultOutputService,
  ) {}

  @OnEvent('command.output')
  async handleCommandOutput(event: CommandOutputEvent) {
    this.logger.debug(
      `Received command output for taskResultId=${event.taskResultId}: ${event.output}`,
    );

    await this.taskResultOutputService.createForTaskResult(
      event.taskResultId,
      event.output,
    );
  }
}
