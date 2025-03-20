import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { TokenService } from '@src/token/token.service'
import { MailService } from '@src/mail/mail.service'
import { RoleService } from '@src/role/role.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { Repository } from 'typeorm'
import { Token } from '@src/token/entities'
import { Role } from '@src/role/entities'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { configServiceMock, responseMock } from '@libs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { mailerMock } from '@src/mail/module-options/mocks'
import { SignInDto, SignUpDto } from '@src/auth/dto'
import { authTokensMock, signUpDtoMock } from '@src/auth/mocks'
import { IAuthMess } from '@src/auth/types'
import { Response } from 'express'
import { IAuthTokens } from '@src/token/types'

describe('AuthController', () => {
    let controller: AuthController
    let authService: AuthService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                TokenService,
                MailService,
                RoleService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Token),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Role),
                    useClass: Repository,
                },
                JwtService,
                { provide: ConfigService, useFactory: configServiceMock },
                { provide: MailerService, useFactory: mailerMock },
            ],
        }).compile()

        controller = module.get<AuthController>(AuthController)
        authService = module.get<AuthService>(AuthService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
        expect(authService).toBeDefined()
    })

    describe('signUp', () => {
        let body: SignUpDto
        let iAuthMess: IAuthMess

        beforeEach(() => {
            body = signUpDtoMock as SignUpDto
            iAuthMess = { message: 'send mail to email' }
        })

        it('should be signed up', async () => {
            jest.spyOn(authService, 'signUp').mockResolvedValueOnce(iAuthMess)

            const result = await controller.signUp(body)

            expect(authService.signUp).toHaveBeenCalledWith(body)
            expect(authService.signUp).toHaveBeenCalledTimes(1)
            expect(result).toEqual({ message: expect.any(String) })
        })
    })

    describe('emailConfirm', () => {
        let token: string
        let agent: string
        let response: Response
        let authTokens: IAuthTokens

        beforeEach(() => {
            token = 'token'
            agent = 'agent'
            response = responseMock as Response
            authTokens = authTokensMock
        })

        it('should be email confirmed', async () => {
            jest.spyOn(authService, 'emailConfirm').mockResolvedValueOnce(
                authTokens,
            )
            jest.spyOn(response, 'cookie').mockReturnThis()

            const result = await controller.emailConfirm(token, agent, response)

            expect(authService.emailConfirm).toHaveBeenCalledWith(token, agent)
            expect(response.cookie).toHaveBeenCalledWith(
                expect.any(String),
                authTokens.refreshToken,
                expect.any(Object),
            )
            expect(result).toEqual({ accessToken: authTokens.accessToken })
        })
    })

    describe('signIn', () => {
        let authTokens: IAuthTokens
        let response: Response
        let agent: string
        let signInDto: SignInDto

        beforeEach(() => {
            authTokens = authTokensMock
            agent = 'agent'
            response = responseMock as Response
            signInDto = signUpDtoMock as SignInDto
        })

        it('should be signed in', async () => {
            jest.spyOn(authService, 'signIn').mockResolvedValueOnce(authTokens)

            const result = await controller.signIn(signInDto, response, agent)

            expect(authService.signIn).toHaveBeenCalledWith(signInDto, agent)
            expect(result).toEqual({ accessToken: authTokens.accessToken })
        })
    })

    describe('logout', () => {
        let cookies: { token: string }
        let response: Response

        beforeEach(() => {
            cookies = { token: 'token' }
            response = responseMock as Response
        })

        it('should be logout', async () => {
            jest.spyOn(authService, 'logout').mockResolvedValueOnce()
            jest.spyOn(response, 'clearCookie').mockReturnThis()
            jest.spyOn(response, 'json').mockReturnThis()

            await controller.logout(cookies, response)

            expect(authService.logout).toHaveBeenCalledWith(cookies.token)
            expect(response.clearCookie).toHaveBeenCalledWith('token')
            expect(response.json).toHaveBeenCalledWith({
                message: expect.any(String),
            })
        })
    })

    describe('refreshToken', () => {
        let cookies: { token: string }
        let response: Response
        let userAgent: string
        let authTokens: IAuthTokens

        beforeEach(() => {
            cookies = { token: 'jwt token' }
            response = responseMock as Response
            userAgent = 'agent'
            authTokens = authTokensMock
        })

        it('should update refresh token', async () => {
            jest.spyOn(authService, 'refreshToken').mockResolvedValueOnce(
                authTokens,
            )
            jest.spyOn(response, 'cookie').mockReturnThis()
            jest.spyOn(response, 'json').mockReturnThis()

            await controller.refreshToken(cookies, userAgent, response)

            expect(authService.refreshToken).toHaveBeenCalledWith(
                cookies.token,
                userAgent,
            )
            expect(response.cookie).toHaveBeenCalledWith(
                'token',
                expect.any(String),
                expect.any(Object),
            )
            expect(response.json).toHaveBeenCalledWith({
                message: expect.any(String),
            })
        })
    })
})
