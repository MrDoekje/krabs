import { Injectable, Logger } from '@nestjs/common';
// import { ExecutorService } from '../executor/executor.service';
import { Command } from 'src/command/entities/command.entity';
import { CommandResultDto } from './dto/command-result.dto';
import { spawn } from 'child_process';

@Injectable()
export class CommandService {
  private readonly logger = new Logger(CommandService.name);

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

      // TODO:  and allow different formats
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
}
