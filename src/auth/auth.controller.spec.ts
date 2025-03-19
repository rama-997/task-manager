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
import { configServiceMock } from '@libs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { mailerMock } from '@src/mail/module-options/mocks'
import { SignUpDto } from '@src/auth/dto'
import { signUpDtoMock } from '@src/auth/mocks'
import { IAuthMess } from '@src/auth/types'

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
})
