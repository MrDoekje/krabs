import { Injectable, Logger } from '@nestjs/common';
// import { ExecutorService } from '../executor/executor.service';
import { Command } from 'src/command/entities/command.entity';
import { CommandResultDto } from 'src/command/dto/command-result.dto';
import { spawn } from 'child_process';
import { CreateCommandDto } from 'src/command/dto/create-command.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/task/entities/task.entity';
import { TaskCommand } from 'src/task/task-command/entities/task-command.entity';
import { Argument } from 'src/argument/entities/argument.entity';

@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);

  constructor(
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskCommand)
    private readonly taskCommandRepository: Repository<TaskCommand>,
    @InjectRepository(Argument)
    private readonly argumentRepository: Repository<Argument>,
  ) {}

  /**
   * Execute a single command
   */
  async executeCommand(
    command: Command,
    commandArguments: Record<string, Record<string, string>>,
  ): Promise<CommandResultDto> {
    this.logger.log(`Executing command: ${command.command} in ${command.wd}`);

    // Build command arguments from provided values and command definition
    const args: string[] = [];
    const commandKey = command.name;
    const providedArgs = commandArguments[commandKey] || {};

    // Add arguments based on command definition
    for (const argument of command.arguments) {
      const argValue = providedArgs[argument.name];

      if (argument.required && !argValue) {
        throw new Error(
          `Required argument "${argument.name}" not provided for command "${command.command}"`,
        );
      }

      if (argValue) {
        args.push(
          command.format
            .replace('{{name}}', argument.name)
            .replace('{{value}}', argValue),
        );
      }
    }

    // Execute the command using executor service
    return await this.runCommand(command.command, args, command.wd);
  }

  private async runCommand(
    command: string,
    args: string[],
    cwd: string,
  ): Promise<CommandResultDto> {
    this.logger.log(
      `Executing command: ${command} ${args.join(' ')} in ${cwd}`,
    );
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        cwd,
        env: process.env,
        shell: true,
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        this.logger.debug(`stdout: ${text}`);
      });

      child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();
        errorOutput += text;
        this.logger.warn(`stderr: ${text}`);
      });

      child.on('close', (code: number) => {
        const success = code === 0;
        this.logger.log(`Command exited with code ${code}`);
        resolve({
          success,
          output,
          error: !success ? errorOutput : undefined,
        });
      });

      child.on('error', (err: Error) => {
        this.logger.error(`Failed to start command: ${err.message}`);
        resolve({
          success: false,
          output,
          error: err.message,
        });
      });
    });
  }

  async create(createCommandDto: CreateCommandDto): Promise<Command> {
    const command = new Command();
    command.wd = createCommandDto.wd;
    command.name = createCommandDto.name;
    command.command = createCommandDto.command;
    command.optional = createCommandDto.optional ?? false;
    command.format = createCommandDto.format ?? '--{{name}}={{value}}';
    command.arguments = [];
    if (createCommandDto.arguments && createCommandDto.arguments.length > 0) {
      for (const argDto of createCommandDto.arguments) {
        const argument = new Argument();
        argument.name = argDto.name;
        argument.required = argDto.required;
        await this.argumentRepository.save(argument);
        command.arguments.push(argument);
      }
    }

    if (createCommandDto.taskId) {
      // Fetch the task entity and its commands
      const task = await this.taskRepository.findOne({
        where: { id: createCommandDto.taskId },
        relations: ['taskCommands'],
      });

      if (!task) {
        throw new Error(`Task with id ${createCommandDto.taskId} not found`);
      }

      // Set the order for the new command
      const lastCommand = task.taskCommands?.length
        ? task.taskCommands[task.taskCommands.length - 1]
        : null;

      // Create a new TaskCommand entity to link the command and the task
      const taskCommand = new TaskCommand();
      taskCommand.task = task;
      taskCommand.command = command;
      taskCommand.executionOrder = lastCommand
        ? lastCommand.executionOrder + 1
        : 1;

      // Save the TaskCommand entity
      const savedTaskCommand =
        await this.taskCommandRepository.save(taskCommand);

      // Set the task relationship
      command.taskCommands = [savedTaskCommand];
    }

    return await this.commandRepository.save(command);
  }

  async update(
    id: string,
    updateCommandDto: Partial<CreateCommandDto>,
  ): Promise<Command> {
    const command = await this.commandRepository.findOne({
      where: { id },
      relations: ['arguments', 'taskCommands'],
    });

    if (!command) {
      throw new Error(`Command with id ${id} not found`);
    }

    if (updateCommandDto.name !== undefined) {
      command.name = updateCommandDto.name;
    }
    if (updateCommandDto.command !== undefined) {
      command.command = updateCommandDto.command;
    }
    if (updateCommandDto.wd !== undefined) {
      command.wd = updateCommandDto.wd;
    }
    if (updateCommandDto.optional !== undefined) {
      command.optional = updateCommandDto.optional;
    }
    if (updateCommandDto.format !== undefined) {
      command.format = updateCommandDto.format;
    }

    if (
      updateCommandDto.arguments &&
      Array.isArray(updateCommandDto.arguments)
    ) {
      // Get current arguments
      const existingArguments = command.arguments || [];
      const newArgNames = new Set(
        updateCommandDto.arguments.map((arg) => arg.name),
      );

      // Remove arguments that are no longer present
      const toRemove = existingArguments.filter(
        (arg) => !newArgNames.has(arg.name),
      );
      if (toRemove.length > 0) {
        await this.argumentRepository.remove(toRemove);
        command.arguments = command.arguments.filter((arg) =>
          newArgNames.has(arg.name),
        );
      }

      // Add new arguments
      for (const argDto of updateCommandDto.arguments) {
        const existingArg = existingArguments.find(
          (arg) => arg.name === argDto.name,
        );
        if (!existingArg) {
          const newArg = new Argument();
          newArg.name = argDto.name;
          newArg.required = argDto.required;
          await this.argumentRepository.save(newArg);
          command.arguments.push(newArg);
        }
      }
    }

    return await this.commandRepository.save(command);
  }

  async findOne(id: string): Promise<Command> {
    const command = await this.commandRepository.findOne({
      where: { id },
      relations: ['arguments', 'taskCommands'],
    });

    if (!command) {
      throw new Error(`Command with id ${id} not found`);
    }
    return command;
  }
}
