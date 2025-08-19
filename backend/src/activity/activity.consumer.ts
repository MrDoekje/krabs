import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivityService } from './activity.service';
import { CommandOutputEvent } from 'src/command/event/command-output.event';
import { CommandStatusEvent } from 'src/command/event/command-status.event';
import { ActivityDto } from 'src/activity/dto/activity.dto';

@Injectable()
export class ActivityConsumer {
  private readonly logger = new Logger(ActivityConsumer.name);

  constructor(private readonly activityService: ActivityService) {}

  @OnEvent('command.output')
  handleCommandOutput(event: CommandOutputEvent) {
    this.logger.debug(
      `Received command output for taskResultId=${event.taskResultId}: ${event.output}`,
    );
    const activity: ActivityDto = {
      id: event.taskResultId,
      type: 'output',
      data: event.output,
      timestamp: new Date().getTime(),
    };
    this.activityService.emitToTaskResult(event.taskResultId, activity);
  }

  @OnEvent('command.status')
  handleCommandStatus(event: CommandStatusEvent) {
    this.logger.log(
      `Received command status for taskResultId=${event.taskResultId}: ${event.status}`,
    );
    const activity: ActivityDto = {
      id: event.taskResultId,
      type: 'status',
      data: event.status,
      timestamp: new Date().getTime(),
    };
    this.activityService.emitToTaskResult(event.taskResultId, activity);

    // Optionally clean up the stream if the task is done
    // if (
    //   event.status === TaskResultStatus.SUCCESS ||
    //   event.status === TaskResultStatus.FAILED
    // ) {
    //   this.activityService.cleanupTaskResultStream(event.taskResultId);
    // }
  }
}
