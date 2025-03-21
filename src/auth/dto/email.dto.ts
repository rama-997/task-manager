import { IsEmail } from 'class-validator'

export class EmailDto {
    @IsEmail({}, { message: 'Некорректный e-mail' })
    email: string
}