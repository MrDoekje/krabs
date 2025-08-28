import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { TaskRunService } from './task-run.service';
import { ExecuteTaskRunDto } from '../dto/execute-task-run.dto';

@Controller('task')
export class TaskRunController {
  constructor(private readonly taskRunService: TaskRunService) {}

  // TODO: pagination
  @Get(':id/run')
  async getAllRunsForTask(@Param('id') id: string) {
    return await this.taskRunService.findAllRunsForTask(id);
  }

  @Get('run')
  async getAll() {
    return await this.taskRunService.findAll();
  }

  // @Patch('run/:id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateTaskRunDto: UpdateTaskRunDto,
  // ) {
  //   return await this.taskRunService.update(id, updateTaskRunDto);
  // }

  //   TODO: instead update the getAll to accept query parameters for filtering, sorting, etc.
  @Get('run/favorites')
  async findFavorited() {
    return this.taskRunService.findFavorited();
  }

  @Post('run/:id/execute')
  async execute(
    @Param('id') id: string,
    @Body() executeTaskRunDto: ExecuteTaskRunDto,
  ) {
    const { queued } = executeTaskRunDto;
    return this.taskRunService.execute(id, queued);
  }

  @Patch('run/:id/favorite')
  async toggleFavorite(@Param('id') id: string) {
    return this.taskRunService.toggleFavorite(id);
  }
}
