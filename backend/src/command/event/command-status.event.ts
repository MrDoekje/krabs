import { TaskResultStatus } from 'src/task/task-result/types';

export class CommandStatusEvent {
  constructor(
    public readonly status: TaskResultStatus,
    public readonly taskResultId: string,
  ) {}
}
