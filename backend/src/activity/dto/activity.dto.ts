import { TaskResultStatus } from 'src/task/task-result/types';

export type ActivityEventType = 'output' | 'status';

class BaseActivityDto {
  /**
   * The unique identifier of the TaskResult entity.
   */
  id: string;

  /**
   * The event type: 'output' or 'status'.
   */
  type: ActivityEventType;
  /**
   * The timestamp of the activity event.
   */
  timestamp: number;
}

export class OutputActivityDto extends BaseActivityDto {
  declare type: 'output';
  /**
   * The event data for 'output' type.
   */
  data: string;
}

export class StatusActivityDto extends BaseActivityDto {
  declare type: 'status';
  /**
   * The event data for 'status' type.
   */
  data: TaskResultStatus;
}

export type ActivityDto = OutputActivityDto | StatusActivityDto;
