import { PartialType } from '@nestjs/mapped-types'
import { CreateTaskDto } from './create-task.dto'
import { IsEnum, IsOptional } from 'class-validator'
import { TaskStatus } from '@src/tasks/types'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus
}