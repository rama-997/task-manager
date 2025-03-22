import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common'
import { TasksService } from './tasks.service'
import { Task } from '@src/tasks/entities'
import { CreateTaskDto, UpdateTaskDto } from '@src/tasks/dto'
import { AuthDecorator, UserId } from '@libs/decorators'
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@AuthDecorator()
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    @ApiOperation({ summary: 'Create task' })
    @ApiResponse({ type: Task, status: HttpStatus.CREATED })
    @ApiResponse({
        description: 'Такая задача уже существует',
        status: HttpStatus.CONFLICT,
    })
    @ApiBody({ type: CreateTaskDto, description: 'Create task dto' })
    create(
        @Body() createTaskDto: CreateTaskDto,
        @UserId() userId: string,
    ): Promise<Task | null> {
        return this.tasksService.create(createTaskDto, userId)
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks' })
    @ApiResponse({ type: [Task], status: HttpStatus.OK })
    findAll(@UserId() userId: string): Promise<Task[]> {
        return this.tasksService.findAll(userId)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get task by id' })
    @ApiResponse({ type: Task, status: HttpStatus.OK })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Задача не найдена',
    })
    @ApiParam({
        name: 'id',
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'User uuid',
    })
    findOne(@Param('id') id: string, @UserId() userId: string) {
        return this.tasksService.findOne(id, userId)
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update task' })
    @ApiParam({
        name: 'id',
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'User uuid',
    })
    @ApiBody({ type: UpdateTaskDto, description: 'Update task dto' })
    @ApiResponse({ type: Task, status: HttpStatus.OK })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Задача не найдена',
    })
    update(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @UserId() userId: string,
    ) {
        return this.tasksService.update(id, updateTaskDto, userId)
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete task' })
    @ApiParam({
        name: 'id',
        type: 'string',
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'User uuid',
    })
    @ApiResponse({ status: HttpStatus.OK })
    remove(@Param('id') id: string, @UserId() userId: string) {
        return this.tasksService.delete(id, userId)
    }
}
