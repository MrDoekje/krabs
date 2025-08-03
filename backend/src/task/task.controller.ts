import { Body, Controller, Post, Get, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from 'src/task/task.service';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { ExecuteTaskRunDto } from 'src/task/dto/execute-task-run.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute a task by name' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        commandArguments: {
          type: 'object',
          example: {
            commandName1: {
              argumentName1: 'argumentValue1',
              argumentName2: 'argumentValue2',
            },
            commandName2: {
              argumentName3: 'argumentValue3',
              argumentName4: 'argumentValue4',
            },
          },
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 200, description: 'Task executed successfully.' })
  async execute(
    @Body() // TODO: create DTO for executing(and queuing) tasks, update command arguments to be allowed to be shared between commands, if names fit
    body: {
      name: string;
      commandArguments?: Record<string, Record<string, string>>;
    },
  ) {
    const { name, commandArguments } = body;
    return this.taskService.executeByName(name, commandArguments);
  }

  @Post('queue')
  @ApiOperation({ summary: 'Queue a task by name' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        commandArguments: {
          type: 'object',
          example: {
            commandName1: {
              argumentName1: 'argumentValue1',
              argumentName2: 'argumentValue2',
            },
            commandName2: {
              argumentName3: 'argumentValue3',
              argumentName4: 'argumentValue4',
            },
          },
        },
        priority: { type: 'number', nullable: true },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Task queued successfully.' })
  async queue(
    @Body()
    body: {
      name: string;
      commandArguments?: Record<string, Record<string, string>>;
      priority?: number;
    },
  ) {
    const { name, commandArguments, priority } = body;
    await this.taskService.queueByName(name, commandArguments, priority, true);
    return { message: `Task "${name}" queued successfully` };
  }

  // TODO: move to their own (sub-)module
  // TaskRun Configuration Endpoints

  @Get('runs')
  @ApiOperation({ summary: 'Get all task run configurations' })
  @ApiResponse({
    status: 200,
    description: 'Task run configurations retrieved successfully.',
  })
  async getAllTaskRuns() {
    return this.taskService.findAllTaskRuns();
  }

  @Get('runs/favorites')
  @ApiOperation({ summary: 'Get all favorited task run configurations' })
  @ApiResponse({
    status: 200,
    description: 'Favorited task run configurations retrieved successfully.',
  })
  async getFavoritedTaskRuns() {
    return this.taskService.findFavoritedTaskRuns();
  }

  @Post('runs/execute')
  @ApiOperation({ summary: 'Execute a task using a task run configuration' })
  @ApiBody({ type: ExecuteTaskRunDto })
  @ApiResponse({
    status: 200,
    description: 'Task run configuration executed successfully.',
  })
  async executeTaskRun(@Body() executeTaskRunDto: ExecuteTaskRunDto) {
    const { taskRunName, queued } = executeTaskRunDto;
    return this.taskService.executeTaskRun(taskRunName, queued);
  }

  @Patch('runs/:name/favorite')
  @ApiOperation({
    summary: 'Toggle favorite status of a task run configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Task run configuration favorite status toggled successfully.',
  })
  async toggleTaskRunFavorite(@Param('name') name: string) {
    return this.taskService.toggleTaskRunFavorite(name);
  }
}
