import { Test, TestingModule } from '@nestjs/testing'
import { Task } from '@src/tasks/entities'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateTaskDto } from '@src/tasks/dto'
import { createTaskDtoMock, taskMock } from '@src/tasks/mocks'
import { TasksService } from '@src/tasks/tasks.service'
import { ConflictException } from '@nestjs/common'

describe('TaskService', () => {
    let service: TasksService
    let taskRepository: Repository<Task>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: getRepositoryToken(Task), useClass: Repository },
            ],
        }).compile()

        service = module.get<TasksService>(TasksService)
        taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task))
    })

    it('should be defined providers', () => {
        expect(service).toBeDefined()
        expect(taskRepository).toBeDefined()
    })

    describe('create', () => {
        let task: Task
        let createTaskDto: CreateTaskDto
        let userId: string

        beforeEach(() => {
            userId = 'id'
            createTaskDto = createTaskDtoMock
            task = taskMock as Task
        })

        it('should create task', async () => {
            jest.spyOn(taskRepository, 'findOneBy').mockResolvedValueOnce(null)
            jest.spyOn(taskRepository, 'save').mockResolvedValueOnce({
                ...createTaskDto,
                ...task,
            })

            const result = await service.create(createTaskDto, userId)

            expect(taskRepository.findOneBy).toHaveBeenCalledWith({
                title: createTaskDto.title,
                user: { id: userId },
            })
            expect(taskRepository.save).toHaveBeenCalledWith({
                ...createTaskDto,
                user: { id: userId },
            })
            expect(result).toEqual(
                expect.objectContaining({ ...createTaskDto, ...task }),
            )
        })

        it('should throw if task exist', async () => {
            jest.spyOn(taskRepository, 'findOneBy').mockResolvedValueOnce(task)
            jest.spyOn(taskRepository, 'save')

            await expect(service.create(createTaskDto, userId)).rejects.toThrow(
                ConflictException,
            )

            expect(taskRepository.findOneBy).toHaveBeenCalledWith({
                title: createTaskDto.title,
                user: { id: userId },
            })
            expect(taskRepository.save).not.toHaveBeenCalled()
        })
    })
})