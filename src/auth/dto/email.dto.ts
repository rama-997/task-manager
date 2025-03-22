import { IsEmail } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class EmailDto {
    @IsEmail({}, { message: 'Некорректный e-mail' })
    @ApiProperty({
        type: 'string',
        name: 'email',
    })
    email: string
}