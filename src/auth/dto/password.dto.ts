import { IsStrongPassword } from 'class-validator'
import { Match } from '@libs/decorators'
import { ApiProperty } from '@nestjs/swagger'

export class PasswordDto {
    @IsStrongPassword(
        {
            minUppercase: 0,
            minSymbols: 0,
            minNumbers: 0,
            minLowercase: 0,
            minLength: 6,
        },
        {
            message: 'Password must have at least 6 characters',
        },
    )
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
