import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignUpDto } from '@src/auth/dto'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() signUpDto:SignUpDto):Promise<{message:string}>{
        return this.authService.signUp(signUpDto)
    }
}
