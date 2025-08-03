import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { TaskRunService } from './task-run.service';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ExecuteTaskRunDto } from '../dto/execute-task-run.dto';

@Controller('task-run')
export class TaskRunController {
  constructor(private readonly taskRunService: TaskRunService) {}

  @Get('')
  @ApiOperation({ summary: 'Get all task run configurations' })
  @ApiResponse({
    status: 200,
    description: 'Task run configurations retrieved successfully.',
  })
  async getAll() {
    return await this.taskRunService.findAll();
  }

  //   TODO: instead update the getAll to accept query parameters for filtering, sorting, etc.
  @Get('favorites')
  @ApiOperation({ summary: 'Get all favorited task run configurations' })
  @ApiResponse({
    status: 200,
    description: 'Favorited task run configurations retrieved successfully.',
  })
  async findFavorited() {
    return this.taskRunService.findFavorited();
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute a task using a task run configuration' })
  @ApiBody({ type: ExecuteTaskRunDto })
  @ApiResponse({
    status: 200,
    description: 'Task run configuration executed successfully.',
  })
  async execute(
    @Param('id') id: string,
    @Body() executeTaskRunDto: ExecuteTaskRunDto,
  ) {
    const { queued } = executeTaskRunDto;
    return this.taskRunService.execute(id, queued);
  }

  @Patch(':id/favorite')
  @ApiOperation({
    summary: 'Toggle favorite status of a task run configuration',
  })
  @ApiResponse({
    status: 200,
    description: 'Task run configuration favorite status toggled successfully.',
  })
  async toggleFavorite(@Param('id') id: string) {
    return this.taskRunService.toggleFavorite(id);
  }
}
