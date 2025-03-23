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
    async create(
        @Body() createTaskDto: CreateTaskDto,
        @UserId() userId: string,
    ): Promise<Task | null> {
        const task = await this.tasksService.create(createTaskDto, userId)
        return new Task(task!)
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks' })
    @ApiResponse({ type: [Task], status: HttpStatus.OK })
    async findAll(@UserId() userId: string): Promise<Task[]> {
        const tasks = await this.tasksService.findAll(userId)
        return tasks.map(task => new Task(task))
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
    async findOne(@Param('id') id: string, @UserId() userId: string) {
        const task = await this.tasksService.findOne(id, userId)
        return new Task(task)
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
    async update(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @UserId() userId: string,
    ) {
        const task = await this.tasksService.update(id, updateTaskDto, userId)
        return new Task(task!)
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
    @ApiResponse({ status: HttpStatus.OK, description: 'success remove' })
    async remove(@Param('id') id: string, @UserId() userId: string) {
        await this.tasksService.delete(id, userId)
        return { message: 'success remove' }
    }
}
