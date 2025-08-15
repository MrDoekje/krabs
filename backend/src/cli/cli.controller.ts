import { Controller, Post, Param, Body } from '@nestjs/common';
import { TaskService } from '../task/task.service';
import { ExecuteTaskDto } from 'src/task/dto/execute-tasks.dto';

@Controller('task')
export class CliController {
  constructor(private readonly taskService: TaskService) {}

  @Post(':name/queue')
  async runQueueByName(
    @Param('name') name: string,
    @Body() body: ExecuteTaskDto,
  ): Promise<{ message: string }> {
    await this.taskService.queueByName(name, body.commandArguments);
    return { message: `Queue "${name}" has been run.` };
  }

  @Post(':name/execute')
  async executeByName(
    @Param('name') name: string,
    @Body()
    body: ExecuteTaskDto,
  ): Promise<{ message: string }> {
    await this.taskService.executeByName(name, body.commandArguments);
    return { message: `Task "${name}" has been executed.` };
  }
}
