import { Test, TestingModule } from '@nestjs/testing'
import { TasksService } from './tasks.service'
import { Repository } from 'typeorm'
import { Task } from '@src/tasks/entities'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateTaskDto } from '@src/tasks/dto'
import { createTaskDtoMock, taskMock } from '@src/tasks/mocks'
import { ConflictException } from '@nestjs/common'

describe('TasksService', () => {
    let service: TasksService
    let taskRepo: Repository<Task>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: getRepositoryToken(Task), useClass: Repository },
            ],
        }).compile()

        service = module.get<TasksService>(TasksService)
        taskRepo = module.get<Repository<Task>>(getRepositoryToken(Task))
    })

    it('should be defined providers', () => {
        expect(service).toBeDefined()
        expect(taskRepo).toBeDefined()
    })

    describe('create', () => {
        let createTakDto: CreateTaskDto
        let task: Task

        beforeEach(() => {
            createTakDto = createTaskDtoMock
            task = taskMock as Task
        })

        it('should be able to create a task', async () => {
            jest.spyOn(taskRepo, 'findOneBy').mockResolvedValueOnce(null)
            jest.spyOn(taskRepo, 'save').mockResolvedValueOnce({
                ...task,
                ...createTakDto,
            })

            const result = await service.create(createTakDto)

            expect(taskRepo.findOneBy).toHaveBeenCalledWith({
                title: createTakDto.title,
            })
            expect(taskRepo.save).toHaveBeenCalledWith(createTakDto)
            expect(result).toEqual({ ...task, ...createTakDto })
        })

        it('should throw if task exist', async () => {
            jest.spyOn(taskRepo, 'findOneBy').mockResolvedValueOnce(task)
            jest.spyOn(taskRepo, 'save')

            await expect(service.create(createTakDto)).rejects.toThrow(
                ConflictException,
            )

            expect(taskRepo.findOneBy).toHaveBeenCalledWith({
                title: createTakDto.title,
            })
            expect(taskRepo.save).not.toHaveBeenCalled()
        })
    })
})
