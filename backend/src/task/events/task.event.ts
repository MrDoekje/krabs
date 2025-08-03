import { IsUUID } from 'class-validator';

/**
 * Event payload for executing a task.
 */
export class ExecuteTaskEvent {
  /**
   * The unique identifier of the task to execute.
   * @type {string}
   */
  @IsUUID()
  taskId: string;

  constructor(taskId: string) {
    this.taskId = taskId;
  }
}

export const EXECUTE_TASK_EVENT = 'execute-task';
