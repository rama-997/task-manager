import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateTaskDto {
    @IsNotEmpty({ message: 'Заголовок не может быть пустым' })
    @IsString({ message: 'Заголовок должен быть строкой' })
    @ApiProperty({
        description: 'task title',
        example: 'some task',
        required: true,
    })
    title: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'task description',
        example: 'some description',
        required: true,
    })
    description: string
}
