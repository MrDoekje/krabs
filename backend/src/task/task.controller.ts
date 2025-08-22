import { Body, Controller, Delete, Post, Put } from '@nestjs/common';
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

  // TODO: pagination
  @Get()
  async findAll(): Promise<Task[]> {
    return this.taskService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.taskService.findById(id);
  }

  @Put(':id')
  async update(@Body() updateTaskDto: UpdateTaskDto, @Param('id') id: string) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }

  // Running a task

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
  async queue(@Param('id') id: string, @Body() body: QueueTaskDto) {
    const { commandArguments, priority } = body;
    await this.taskService.queueById(id, commandArguments, priority);
    return { message: `Task "${id}" queued successfully` };
  }
}
