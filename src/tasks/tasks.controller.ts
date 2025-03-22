import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common'
import { TasksService } from './tasks.service'
import { Task } from '@src/tasks/entities'
import { CreateTaskDto, UpdateTaskDto } from '@src/tasks/dto'
import { AuthDecorator, UserId } from '@libs/decorators'

@Controller('tasks')
@AuthDecorator()
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    create(
        @Body() createTaskDto: CreateTaskDto,
        @UserId() userId: string,
    ): Promise<Task> {
        return this.tasksService.create(createTaskDto, userId)
    }

    @Get()
    findAll(@UserId() userId: string): Promise<Task[]> {
        return this.tasksService.findAll(userId)
    }

    @Get(':id')
    findOne(@Param('id') id: string, @UserId() userId: string) {
        return this.tasksService.findOne(id, userId)
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @UserId() userId: string,
    ) {
        return this.tasksService.update(id, updateTaskDto, userId)
    }

    @Delete(':id')
    remove(@Param('id') id: string, @UserId() userId: string) {
        return this.tasksService.delete(id, userId)
    }
}