import { Test, TestingModule } from '@nestjs/testing'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Task } from '@src/tasks/entities'
import { Repository } from 'typeorm'
import { CreateTaskDto } from '@src/tasks/dto'
import { createTaskDtoMock, taskMock } from '@src/tasks/mocks'

describe('TasksController', () => {
    let controller: TasksController
    let taskService: TasksService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                TasksService,
                { provide: getRepositoryToken(Task), useClass: Repository },
            ],
        }).compile()

        controller = module.get<TasksController>(TasksController)
        taskService = module.get<TasksService>(TasksService)
    })

    it('should be defined providers', () => {
        expect(controller).toBeDefined()
        expect(taskService).toBeDefined()
    })

    describe('create', () => {
        let createTaskDto: CreateTaskDto
        let task: Task

        beforeEach(() => {
            createTaskDto = createTaskDtoMock
            task = taskMock as Task
        })

        it('should be created task', async () => {
            jest.spyOn(taskService, 'create').mockResolvedValueOnce({
                ...task,
                ...createTaskDto,
            })

            const result = await taskService.create(createTaskDto)

            expect(taskService.create).toHaveBeenCalledWith(createTaskDto)
            expect(result).toEqual({ ...task, ...createTaskDto })
        })
    })
})
