export type QueueEventType = 'queued' | 'started' | 'ended'

export interface QueueDto {
  /**
   * The event type: 'queued', 'started', or 'ended'.
   */
  event: QueueEventType

  /**
   * The timestamp of the queue event.
   */
  timestamp: number

  /**
   * The unique identifier of the Task entity.
   */
  taskId: string
  /**
   * The unique identifier of the TaskResult entity.
   */
  taskResultId: string
}

export enum TaskResultStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
}

export type ActivityEventType = 'output' | 'status'

// TODO: these types are copied from the activity module in the backend, we need to figure out how to use kiota to fix it
class BaseActivityDto {
  /**
   * The unique identifier of the TaskResult entity.
   */
  id: string

  /**
   * The event type: 'output' or 'status'.
   */
  type: ActivityEventType
  /**
   * The timestamp of the activity event.
   */
  timestamp: number
}
export class OutputActivityDto extends BaseActivityDto {
  declare type: 'output'
  /**
   * The event data for 'output' type.
   */
  data: string
}
export class StatusActivityDto extends BaseActivityDto {
  declare type: 'status'
  /**
   * The event data for 'status' type.
   */
  data: TaskResultStatus
}

export type ActivityDto = OutputActivityDto | StatusActivityDto
