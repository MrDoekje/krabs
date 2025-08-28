export type CommandArguments = Record<string, Record<string, string>>;

export type RunOrArguments =
  | {
      commandArguments: CommandArguments;
    }
  | {
      taskRunId: string;
    };

export const isArguments = (
  options: RunOrArguments,
): options is { commandArguments: CommandArguments } => {
  return 'commandArguments' in options;
};

export const isTaskRunId = (
  options: RunOrArguments,
): options is { taskRunId: string } => {
  return 'taskRunId' in options;
};
