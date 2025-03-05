import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Res,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignInDto, SignUpDto } from '@src/auth/dto'
import { Response } from 'express'
import { cookieOptions, resOption } from '@libs/options'
import { IAccessToken } from '@src/auth/types'
import { UserAgent } from '@libs/decorators'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @HttpCode(HttpStatus.OK)
    async signUp(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
        return this.authService.signUp(signUpDto)
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body() signInDto: SignInDto,
        @Res(resOption) res: Response,
        @UserAgent() agent:string
    ): Promise<IAccessToken> {
        const { accessToken, refreshToken } =
            await this.authService.signIn(signInDto,agent)
        res.cookie('token', refreshToken, cookieOptions)
        return { accessToken }
    }
}
