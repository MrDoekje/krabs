import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from 'src/task/task.service';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { Get, Param } from '@nestjs/common';
import { Task } from 'src/task/entities/task.entity';
import { ExecuteTaskDto } from 'src/task/dto/execute-tasks.dto';
import { QueueTaskDto } from 'src/task/dto/queue-task.dto';
import { UpdateTaskDto } from 'src/task/dto/update-task.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Put(':id')
  async update(@Body() updateTaskDto: UpdateTaskDto, @Param('id') id: string) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Post(':id/execute')
  async execute(
    @Param('id') id: string,
    @Body()
    body: ExecuteTaskDto,
  ) {
    const { commandArguments } = body;
    return this.taskService.executeById(id, commandArguments);
  }

  @Post(':id/queue')
  @ApiOperation({ summary: 'Queue a task by name' })
  @ApiResponse({ status: 201, description: 'Task queued successfully.' })
  async queue(@Param('id') id: string, @Body() body: QueueTaskDto) {
    const { commandArguments, priority } = body;
    await this.taskService.queueById(id, commandArguments, priority, true);
    return { message: `Task "${id}" queued successfully` };
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  async findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get(':id')
  async findByName(@Param('id') id: string) {
    return this.taskService.findById(id);
  }
}
