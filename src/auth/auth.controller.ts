import {
    Body,
    Controller, Get,
    HttpCode,
    HttpStatus,
    Post, Query,
    Res,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignInDto, SignUpDto } from '@src/auth/dto'
import { Response } from 'express'
import { cookieOptions, resOption } from '@libs/options'
import { IAccessToken } from '@src/auth/types'
import { UserAgent } from '@libs/decorators'
import { ConfigService } from '@nestjs/config'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {
    }

    @Post('signup')
    @HttpCode(HttpStatus.OK)
    async signUp(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
        return this.authService.signUp(signUpDto)
    }

    @Get('email-confirm')
    @HttpCode(HttpStatus.OK)
    async emailConfirm(@Query('token') token: string, @UserAgent() agent: string, @Res() res: Response) {
        const {accessToken, refreshToken} = await this.authService.emailConfirm(token, agent)
        res.cookie('token', refreshToken, cookieOptions)
        res.json({accessToken}).redirect(this.configService.getOrThrow<string>('CLIENT_DOMAIN'))
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body() signInDto: SignInDto,
        @Res(resOption) res: Response,
        @UserAgent() agent: string
    ): Promise<IAccessToken> {
        const {accessToken, refreshToken} =
            await this.authService.signIn(signInDto, agent)
        res.cookie('token', refreshToken, cookieOptions)
        return {accessToken}
    }
}
