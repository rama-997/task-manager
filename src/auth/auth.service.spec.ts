import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { TokenService } from '@src/token/token.service'
import { MailService } from '@src/mail/mail.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { Repository } from 'typeorm'
import * as bcryptjs from 'bcryptjs'
import { authTokensMock, signUpDtoMock, userMock } from '@src/auth/mocks'
import { SignInDto, SignUpDto } from '@src/auth/dto'
import {
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import { mailerMock } from '@src/mail/module-options/mocks'
import { configServiceMock } from '@libs/common'
import { Token } from '@src/token/entities'
import { AuthTokens } from '@src/token/types'
import { RoleService } from '@src/role/role.service'
import { Role } from '@src/role/entities'
import { roleMock } from '@src/role/mocks'
import { ERoles } from '@src/role/types'

describe('AuthService', () => {
    let service: AuthService
    let tokenService: TokenService
    let mailService: MailService
    let userRepository: Repository<User>
    let roleService: RoleService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
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
        jest.clearAllMocks()

        service = module.get<AuthService>(AuthService)
        tokenService = module.get<TokenService>(TokenService)
        mailService = module.get<MailService>(MailService)
        userRepository = module.get<Repository<User>>(getRepositoryToken(User))
        roleService = module.get<RoleService>(RoleService)
    })

    describe('signUp', () => {
        let hashedPass: string
        let user: Partial<User>
        let signUpDto: Partial<SignUpDto>
        let emailToken: string
        let role: Role

        beforeEach(() => {
            hashedPass = 'hashedPassword'
            user = userMock
            signUpDto = signUpDtoMock
            emailToken = 'emailToken'
            role = roleMock as Role
        })

        it('should be signed up', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null)
            jest.spyOn(bcryptjs, 'hash').mockReturnValueOnce(hashedPass as any)
            jest.spyOn(roleService, 'findOne').mockResolvedValueOnce(role)
            jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
                ...user,
                ...signUpDto,
                password: hashedPass,
            } as User)
            jest.spyOn(tokenService, 'emailToken').mockResolvedValueOnce(
                emailToken,
            )
            jest.spyOn(mailService, 'signUpMail').mockResolvedValueOnce()

            const result = await service.signUp(signUpDto as SignUpDto)

            expect(result).toEqual({ message: expect.any(String) })
            expect(userRepository.findOneBy).toHaveBeenCalledTimes(2)
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(1, {
                email: signUpDto.email,
            })
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(2, {
                login: signUpDto.login,
            })
            expect(bcryptjs.hash).toHaveBeenCalledWith(signUpDto.password, 3)
            expect(roleService.findOne).toHaveBeenCalledWith(ERoles.USER)
            expect(userRepository.save).toHaveBeenCalledWith({
                ...signUpDto,
                password: hashedPass,
                roles: [role],
            })
            expect(tokenService.emailToken).toHaveBeenCalledWith(user.id)
            expect(mailService.signUpMail).toHaveBeenCalledWith(
                emailToken,
                signUpDto.email,
            )
        })

        it('exist e-mail', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(
                user as User,
            )
            jest.spyOn(bcryptjs, 'hash')
            jest.spyOn(roleService, 'findOne')
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService, 'emailToken')
            jest.spyOn(mailService, 'signUpMail')

            await expect(
                service.signUp(signUpDto as SignUpDto),
            ).rejects.toThrow(ConflictException)

            expect(userRepository.findOneBy).toHaveBeenCalledTimes(1)
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(1, {
                email: signUpDto.email,
            })
            expect(bcryptjs.hash).not.toHaveBeenCalled()
            expect(roleService.findOne).not.toHaveBeenCalled()
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.emailToken).not.toHaveBeenCalled()
            expect(mailService.signUpMail).not.toHaveBeenCalled()
        })

        it('exist login', async () => {
            jest.spyOn(userRepository, 'findOneBy')
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(user as User)
            jest.spyOn(bcryptjs, 'hash')
            jest.spyOn(roleService, 'findOne')
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService, 'emailToken')
            jest.spyOn(mailService, 'signUpMail')

            await expect(
                service.signUp(signUpDto as SignUpDto),
            ).rejects.toThrow(ConflictException)

            expect(userRepository.findOneBy).toHaveBeenCalledTimes(2)
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(1, {
                email: signUpDto.email,
            })
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(2, {
                login: signUpDto.login,
            })
            expect(bcryptjs.hash).not.toHaveBeenCalled()
            expect(roleService.findOne).not.toHaveBeenCalled()
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.emailToken).not.toHaveBeenCalled()
            expect(mailService.signUpMail).not.toHaveBeenCalled()
        })
    })

    describe('signIn', () => {
        let signInDto: SignInDto
        let agent: string
        let user: User
        let authTokens: AuthTokens

        beforeEach(() => {
            signInDto = signUpDtoMock as SignInDto
            agent = 'agent'
            user = userMock as User
            authTokens = authTokensMock
        })

        it('should be sign in', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user)
            jest.spyOn(bcryptjs, 'compare').mockImplementationOnce(() => true)
            jest.spyOn(tokenService, 'authorization').mockResolvedValueOnce(
                authTokens,
            )

            const result = await service.signIn(signInDto, agent)

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: [
                    { email: signInDto.loginOrEmail },
                    { login: signInDto.loginOrEmail },
                ],
                relations: ['roles'],
            })
            expect(bcryptjs.compare).toHaveBeenCalledWith(
                signInDto.password,
                user.password,
            )
            expect(tokenService.authorization).toHaveBeenCalledWith(user, agent)
            expect(result).toEqual(authTokens)
        })

        it('does not exist email or login', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null)
            jest.spyOn(bcryptjs, 'compare')
            jest.spyOn(tokenService, 'authorization')

            await expect(service.signIn(signInDto, agent)).rejects.toThrow(
                NotFoundException,
            )

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: [
                    { email: signInDto.loginOrEmail },
                    { login: signInDto.loginOrEmail },
                ],
                relations: ['roles'],
            })
            expect(bcryptjs.compare).not.toHaveBeenCalled()
            expect(tokenService.authorization).not.toHaveBeenCalled()
        })

        it('wrong password', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user)
            jest.spyOn(bcryptjs, 'compare').mockImplementationOnce(() => false)
            jest.spyOn(tokenService, 'authorization')

            await expect(service.signIn(signInDto, agent)).rejects.toThrow(
                ConflictException,
            )

            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: [
                    { email: signInDto.loginOrEmail },
                    { login: signInDto.loginOrEmail },
                ],
                relations: ['roles'],
            })
            expect(bcryptjs.compare).toHaveBeenCalledWith(
                signInDto.password,
                user.password,
            )
            expect(tokenService.authorization).not.toHaveBeenCalled()
        })
    })

    describe('emailConfirm', () => {
        let token: string
        let agent: string
        let payload: { id: string }
        let user: User
        let authTokens: AuthTokens

        beforeEach(async () => {
            token = 'token'
            agent = 'agent'
            payload = { id: 'id' }
            user = userMock as User
            authTokens = authTokensMock
        })

        it('should get tokens', async () => {
            jest.spyOn(tokenService, 'verifyEmailToken').mockResolvedValueOnce(
                payload,
            )
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce({
                ...user,
                id: payload.id,
            })
            jest.spyOn(userRepository, 'save').mockResolvedValueOnce({} as User)
            jest.spyOn(tokenService, 'authorization').mockResolvedValueOnce(
                authTokens,
            )

            const result = await service.emailConfirm(token, agent)

            expect(tokenService.verifyEmailToken).toHaveBeenCalledWith(token)
            expect(userRepository.findOneBy).toHaveBeenCalledWith({
                id: payload.id,
            })
            expect(userRepository.save).toHaveBeenCalledWith({
                ...user,
                id: payload.id,
                isConfirm: true,
            })
            expect(tokenService.authorization).toHaveBeenCalledWith(
                { ...user, id: payload.id, isConfirm: true },
                agent,
            )
            expect(result).toEqual(authTokens)
        })

        it('token does not exist', async () => {
            jest.spyOn(tokenService, 'verifyEmailToken')
            jest.spyOn(userRepository, 'findOneBy')
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService, 'authorization')

            await expect(service.emailConfirm('', agent)).rejects.toThrow(
                UnauthorizedException,
            )

            expect(tokenService.verifyEmailToken).not.toHaveBeenCalled()
            expect(userRepository.findOneBy).not.toHaveBeenCalled()
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.authorization).not.toHaveBeenCalled()
        })

        it('invalid token', async () => {
            jest.spyOn(tokenService, 'verifyEmailToken').mockResolvedValueOnce(
                null,
            )
            jest.spyOn(userRepository, 'findOneBy')
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService, 'authorization')

            await expect(service.emailConfirm(token, agent)).rejects.toThrow(
                UnauthorizedException,
            )

            expect(tokenService.verifyEmailToken).toHaveBeenCalledWith(token)
            expect(userRepository.findOneBy).not.toHaveBeenCalled()
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.authorization).not.toHaveBeenCalled()
        })

        it('user did not found', async () => {
            jest.spyOn(tokenService, 'verifyEmailToken').mockResolvedValueOnce(
                payload,
            )
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null)
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService, 'authorization')

            await expect(service.emailConfirm(token, agent)).rejects.toThrow(
                UnauthorizedException,
            )

            expect(tokenService.verifyEmailToken).toHaveBeenCalledWith(token)
            expect(userRepository.findOneBy).toHaveBeenCalledWith({
                id: payload.id,
            })
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.authorization).not.toHaveBeenCalled()
        })
    })
})
