import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from 'src/task/task.service';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { Get, Param } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { Task } from './entities/task.entity';

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

  @Post(':name/execute')
  @ApiOperation({ summary: 'Execute a task by name' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
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
    },
  })
  @ApiResponse({ status: 200, description: 'Task executed successfully.' })
  async execute(
    @Param('name') name: string,
    @Body() // TODO: create DTO for executing(and queuing) tasks, update command arguments to be allowed to be shared between commands, if names fit
    body: {
      commandArguments?: Record<string, Record<string, string>>;
    },
  ) {
    const { commandArguments } = body;
    return this.taskService.executeByName(name, commandArguments);
  }

  @Post(':name/queue')
  @ApiOperation({ summary: 'Queue a task by name' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
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
    @Param('name') name: string,
    @Body()
    body: {
      commandArguments?: Record<string, Record<string, string>>;
      priority?: number;
    },
  ) {
    const { commandArguments, priority } = body;
    await this.taskService.queueByName(name, commandArguments, priority, true);
    return { message: `Task "${name}" queued successfully` };
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  async findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get a task by name' })
  @ApiParam({ name: 'name', type: 'string', description: 'Task name' })
  @ApiResponse({ status: 200, description: 'Task found.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async findByName(@Param('name') name: string) {
    return this.taskService.findByName(name);
  }
}
