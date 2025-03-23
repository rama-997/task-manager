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
import { EmailDto, PasswordDto, SignInDto, SignUpDto } from '@src/auth/dto'
import { Response } from 'express'
import { cookieOptions, resOption } from '@libs/options'
import { IAccessToken, IAuthMess } from '@src/auth/types'
import { Cookie, UserAgent } from '@libs/decorators'
import {
    ApiBody,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'

@Controller('auth')
@ApiTags('authorization')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('sign-up')
    @ApiOperation({ summary: 'sign-up' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Было отправлено письмо на вашу электронную почту',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Такой логин уже занят',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Такой e-mail уже зарегистрирован',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Некорректный e-mail',
    })
    @ApiBody({ type: SignUpDto, description: 'sign up dto' })
    @HttpCode(HttpStatus.OK)
    async signUp(@Body() signUpDto: SignUpDto): Promise<IAuthMess> {
        return this.authService.signUp(signUpDto)
    }

    @Get('email-confirm')
    @ApiExcludeEndpoint()
    // @ApiOperation({ summary: 'email-confirm' })
    // @ApiQuery({ name: 'email-confirm' })
    // @ApiResponse({
    //     status: HttpStatus.OK,
    //     type: 'string',
    //     description: 'jwt token',
    // })
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
    @ApiOperation({ summary: 'sign-in' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Было отправлено письмо на вашу электронную почту',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Неверный пароль',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Такой логин или e-mail не зарегистрирован',
    })
    @ApiBody({ type: SignInDto, description: 'sign in dto' })
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
    @ApiOperation({ summary: 'logout' })
    @ApiResponse({ status: HttpStatus.OK, description: 'success logout' })
    async logout(@Cookie() cookies: any, @Res() res: Response) {
        const { token } = cookies
        await this.authService.logout(token)
        res.clearCookie('token')
        res.json({ message: 'success logout' })
    }

    @Get('refresh-token')
    // @ApiOperation({ summary: 'refresh-token' })
    // @ApiResponse({ status: HttpStatus.OK })
    @ApiExcludeEndpoint()
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

    @ApiExcludeEndpoint()
    @Post('reset-password')
    // @ApiOperation({ summary: 'reset-password' })
    // @ApiBody({ type: EmailDto, description: 'email dto' })
    // @ApiResponse({
    //     status: HttpStatus.OK,
    //     description: 'Было отправлено письмо на вашу элек.почту',
    // })
    // @ApiResponse({
    //     status: HttpStatus.NOT_FOUND,
    //     description: 'email dose not found',
    // })
    @HttpCode(HttpStatus.OK)
    async resetPass(@Body() emailDto: EmailDto) {
        await this.authService.resetPass(emailDto)
        return { message: 'Было отправлено письмо на вашу элек.почту' }
    }

    @ApiExcludeEndpoint()
    @Post('confirm-password')
    // @ApiOperation({ summary: 'confirm-password' })
    // @ApiBody({ type: PasswordDto, description: 'password dto' })
    // @ApiResponse({ status: HttpStatus.OK, description: 'pass confirmed' })
    @HttpCode(HttpStatus.OK)
    async confirmPassword(
        @Body() passwordDto: PasswordDto,
        @Query('token') token: string,
    ) {
        await this.authService.confirmPassword(passwordDto, token)
        return true
    }
}
