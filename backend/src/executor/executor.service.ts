import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { CommandResultDto } from 'src/executor/dto/command-result.dto';

@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name);

  async executeCommand(
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
