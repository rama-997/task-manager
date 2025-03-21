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
import { AuthDecorator } from '@libs/decorators'

@Controller('tasks')
@AuthDecorator()
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
        return this.tasksService.create(createTaskDto)
    }

    @Get()
    findAll() {
        return this.tasksService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tasksService.findOne(+id)
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
        return this.tasksService.update(+id, updateTaskDto)
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tasksService.remove(+id)
    }
}
