import { PartialType } from '@nestjs/mapped-types'
import { CreateTaskDto } from './create-task.dto'
import { IsEnum, IsOptional } from 'class-validator'
import { TaskStatus } from '@src/tasks/types'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsOptional()
    @IsEnum(TaskStatus)
    @ApiProperty({
        type: 'string',
        example: Object.values(TaskStatus),
        description: 'Task status',
        required: false,
    })
    status?: TaskStatus
}