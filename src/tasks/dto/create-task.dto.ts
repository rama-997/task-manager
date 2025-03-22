import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTaskDto {
    @IsNotEmpty({ message: 'Заголовок не может быть пустым' })
    @IsString({ message: 'Заголовок должен быть строкой' })
    title: string

    @IsNotEmpty()
    @IsString()
    description: string
}
