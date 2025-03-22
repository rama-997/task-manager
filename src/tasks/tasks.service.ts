import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { CreateTaskDto, UpdateTaskDto } from '@src/tasks/dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Task } from '@src/tasks/entities'
import { Repository } from 'typeorm'

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    ) {}

    async create(
        createTaskDto: CreateTaskDto,
        userId: string,
    ): Promise<Task | null> {
        const task = await this.taskRepo.findOneBy({
            title: createTaskDto.title,
            user: { id: userId },
        })
        if (task) {
            throw new ConflictException('Такая задача уже существует')
        }
        const savedTask = await this.taskRepo.save({
            ...createTaskDto,
            user: { id: userId },
        })
        return this.taskRepo.findOne({
            where: { id: savedTask.id, user: { id: userId } },
            relations: ['user'],
        })
    }

    async findAll(userId: string): Promise<Task[]> {
        return await this.taskRepo.find({
            where: { user: { id: userId } },
            relations: ['user'],
        })
    }

    async findOne(id: string, userId: string): Promise<Task> {
        const task = await this.taskRepo.findOne({
            where: { id, user: { id: userId } },
            relations: ['user'],
        })
        if (!task) throw new NotFoundException('Задача не найдена')
        return task
    }

    async update(
        id: string,
        dto: UpdateTaskDto,
        userId: string,
    ): Promise<Task | null> {
        const task = await this.taskRepo.findOne({
            where: { id, user: { id: userId } },
        })
        if (!task) throw new NotFoundException('Задача не найдена')
        const updatedTask = await this.taskRepo.save({
            ...task,
            ...dto,
            user: { id: userId },
        })
        return this.taskRepo.findOne({
            where: { id, user: { id: userId } },
            relations: ['user'],
        })
    }

    async delete(id: string, userId: string): Promise<void> {
        const task = await this.taskRepo.findOne({
            where: { id, user: { id: userId } },
        })
        if (!task) throw new NotFoundException('Задача не найдена')
        await this.taskRepo.remove(task)
    }
}
