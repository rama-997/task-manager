import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Res,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { EmailDto, SignInDto, SignUpDto } from '@src/auth/dto'
import { Response } from 'express'
import { cookieOptions, resOption } from '@libs/options'
import { IAccessToken, IAuthMess } from '@src/auth/types'
import { Cookie, UserAgent } from '@libs/decorators'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('sign-up')
    @HttpCode(HttpStatus.OK)
    async signUp(@Body() signUpDto: SignUpDto): Promise<IAuthMess> {
        return this.authService.signUp(signUpDto)
    }

    @Get('email-confirm')
    async emailConfirm(
        @Query('token') token: string,
        @UserAgent() agent: string,
        @Res(resOption) res: Response,
    ): Promise<IAccessToken> {
        const { accessToken, refreshToken } =
            await this.authService.emailConfirm(token, agent)
        res.cookie('token', refreshToken, cookieOptions)
        return { accessToken }
    }

    @Post('sign-in')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body() signInDto: SignInDto,
        @Res(resOption) res: Response,
        @UserAgent() agent: string,
    ): Promise<IAccessToken> {
        const { accessToken, refreshToken } = await this.authService.signIn(
            signInDto,
            agent,
        )
        res.cookie('token', refreshToken, cookieOptions)
        return { accessToken }
    }

    @Get('logout')
    async logout(@Cookie() cookies: any, @Res() res: Response) {
        const { token } = cookies
        await this.authService.logout(token)
        res.clearCookie('token')
        res.json({ message: 'success logout' })
    }

    @Get('refresh-token')
    async refreshToken(
        @Cookie() cookies: any,
        @UserAgent() agent: string,
        @Res() res: Response,
    ) {
        const { token } = cookies
        const tokens = await this.authService.refreshToken(token, agent)
        res.cookie('token', tokens.refreshToken, cookieOptions)
        res.json({ message: 'Refreshed' })
    }

    @Post('reset-password')
    async resetPass(@Body() emailDto: EmailDto) {
        await this.authService.resetPass(emailDto)
    }
}
