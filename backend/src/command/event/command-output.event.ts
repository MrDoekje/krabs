export class CommandOutputEvent {
  constructor(
    public readonly output: string,
    public readonly taskResultId: string,
  ) {}
}
