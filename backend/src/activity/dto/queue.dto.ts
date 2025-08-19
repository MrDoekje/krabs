export type QueueEventType = 'queued' | 'started' | 'ended';

class BaseQueueDto {
  /**
   * The event type: 'queued', 'started', or 'ended'.
   */
  event: QueueEventType;

  /**
   * The timestamp of the queue event.
   */
  timestamp: number;

  /**
   * The unique identifier of the Task entity.
   */
  taskId: string;
}

export class QueuedQueueDto extends BaseQueueDto {
  declare event: 'queued';
}

export class StartedQueueDto extends BaseQueueDto {
  declare event: 'started';
  /**
   * The unique identifier of the TaskResult entity.
   */
  taskResultId: string;
}

export class EndedQueueDto extends BaseQueueDto {
  declare event: 'ended';
  /**
   * The unique identifier of the TaskResult entity.
   */
  taskResultId: string;
}

export type QueueDto = QueuedQueueDto | StartedQueueDto | EndedQueueDto;
