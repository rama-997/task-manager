import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsStrongPassword,
    MaxLength,
} from 'class-validator'
import { Match } from '@libs/decorators'
import { ApiProperty } from '@nestjs/swagger'

export class SignUpDto {
    @IsNotEmpty({ message: 'Логин не может быть пустым' })
    @IsString({ message: 'Логин должен иметь только строковое значение' })
    @ApiProperty({
        type: 'string',
        name: 'login',
    })
    login: string

    @IsEmail({}, { message: 'Некорректный e-mail' })
    @ApiProperty({
        type: 'string',
        name: 'email',
    })
    email: string

    @IsStrongPassword(
        {
            minLength: 6,
            minLowercase: 0,
            minNumbers: 0,
            minSymbols: 0,
            minUppercase: 0,
        },
        { message: 'Пароль должен быть более 6 символов' },
    )
    @MaxLength(12, { message: 'Пароль не должен превышать 12 символов' })
    @ApiProperty({
        type: 'string',
        name: 'password',
    })
    password: string

    @Match('password')
    @ApiProperty({
        type: 'string',
        name: 'passwordConfirm',
    })
    passwordConfirm: string
}
