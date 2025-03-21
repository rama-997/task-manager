import { ConflictException, Injectable } from '@nestjs/common'
import { CreateTaskDto, UpdateTaskDto } from '@src/tasks/dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Task } from '@src/tasks/entities'
import { Repository } from 'typeorm'

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task) private readonly TaskRepo: Repository<Task>,
    ) {}

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const task = await this.TaskRepo.findOneBy({
            title: createTaskDto.title,
        })
        if (task) {
            throw new ConflictException('Такая задача уже есть')
        }
        return this.TaskRepo.save(createTaskDto)
    }

    findAll() {
        return `This action returns all tasks`
    }

    findOne(id: number) {
        return `This action returns a #${id} task`
    }

    update(id: number, updateTaskDto: UpdateTaskDto) {
        return `This action updates a #${id} task`
    }

    remove(id: number) {
        return `This action removes a #${id} task`
    }
}
