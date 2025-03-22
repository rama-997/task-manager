import { IsNotEmpty, IsString } from 'class-validator'
import { IsLoginOrEmail } from '@libs/decorators'
import { ApiProperty } from '@nestjs/swagger'

export class SignInDto {
    @IsLoginOrEmail()
    @ApiProperty({
        type: 'string',
        name: 'loginOrEmail',
    })
    loginOrEmail: string

    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be string' })
    @ApiProperty({
        type: 'string',
        name: 'password',
    })
    password: string
}