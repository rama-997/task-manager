import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsStrongPassword, MaxLength,
} from 'class-validator'
import { Match } from '@libs/decorators'

export class SignUpDto {
    @IsNotEmpty({ message: 'Логин не может быть пустым' })
    @IsString({ message: 'Логин должен иметь только строковое значение' })
    login: string

    @IsEmail({}, { message: 'Некорректный e-mail' })
    email: string

    @IsStrongPassword(
        {
            minLength: 3,
            minLowercase: 0,
            minNumbers: 0,
            minSymbols: 0,
            minUppercase: 0,
        },
        { message: 'Пароль недостаточно надёжен' },
    )
    @MaxLength(12,{message:'Пароль не должен превышать 12 символов'})
    password: string

    @Match('password')
    passwordConfirm: string
}
