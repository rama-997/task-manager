import { IsNotEmpty, IsString } from 'class-validator'
import { IsLoginOrEmail } from '@libs/decorators'

export class SignInDto{
    @IsLoginOrEmail()
    loginOrEmail:string

    @IsNotEmpty({message: 'Password is required'})
    @IsString({message: 'Password must be string'})
    password:string
}