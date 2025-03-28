import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { TokenService } from '@src/token/token.service'
import { MailService } from '@src/mail/mail.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { Repository } from 'typeorm'
import * as bcryptjs from 'bcryptjs'
import { authTokensMock, signUpDtoMock, userMock } from '@src/auth/mocks'
import { EmailDto, SignInDto, SignUpDto } from '@src/auth/dto'
import {
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import { mailerMock } from '@src/mail/module-options/mocks'
import { configServiceMock } from '@libs/common'
import { Token } from '@src/token/entities'
import { IAuthTokens, UserPayload } from '@src/token/types'
import { RoleService } from '@src/role/role.service'
import { Role } from '@src/role/entities'
import { roleMock } from '@src/role/mocks'
import { ERoles } from '@src/role/types'
import { userPayloadMock } from '@src/token/mocks'

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

    it('should be defined providers', () => {
        expect(service).toBeDefined()
        expect(tokenService).toBeDefined()
        expect(mailService).toBeDefined()
        expect(userRepository).toBeDefined()
        expect(roleService).toBeDefined()
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
            jest.spyOn(roleService, 'create').mockResolvedValueOnce(role)
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
            jest.spyOn(roleService, 'create')
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
        let authTokens: IAuthTokens

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

        it('forbidden if user not confirm email', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
                ...user,
                isConfirm: false,
            })
            jest.spyOn(bcryptjs, 'compare')
            jest.spyOn(tokenService, 'authorization')

            await expect(service.signIn(signInDto, agent)).rejects.toThrow(
                ForbiddenException,
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
        let authTokens: IAuthTokens

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
            jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({
                ...user,
                id: payload.id,
            })
            jest.spyOn(userRepository, 'save').mockResolvedValueOnce({} as User)
            jest.spyOn(tokenService, 'authorization').mockResolvedValueOnce(
                authTokens,
            )

            const result = await service.emailConfirm(token, agent)

            expect(tokenService.verifyEmailToken).toHaveBeenCalledWith(token)
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: payload.id },
                relations: ['roles'],
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
            jest.spyOn(userRepository, 'findOne')
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService, 'authorization')

            await expect(service.emailConfirm('', agent)).rejects.toThrow(
                UnauthorizedException,
            )

            expect(tokenService.verifyEmailToken).not.toHaveBeenCalled()
            expect(userRepository.findOne).not.toHaveBeenCalled()
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.authorization).not.toHaveBeenCalled()
        })

        it('invalid token', async () => {
            jest.spyOn(tokenService, 'verifyEmailToken').mockResolvedValueOnce(
                null,
            )
            jest.spyOn(userRepository, 'findOne')
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService, 'authorization')

            await expect(service.emailConfirm(token, agent)).rejects.toThrow(
                UnauthorizedException,
            )

            expect(tokenService.verifyEmailToken).toHaveBeenCalledWith(token)
            expect(userRepository.findOne).not.toHaveBeenCalled()
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.authorization).not.toHaveBeenCalled()
        })

        it('user did not found', async () => {
            jest.spyOn(tokenService, 'verifyEmailToken').mockResolvedValueOnce(
                payload,
            )
            jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null)
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService, 'authorization')

            await expect(service.emailConfirm(token, agent)).rejects.toThrow(
                UnauthorizedException,
            )

            expect(tokenService.verifyEmailToken).toHaveBeenCalledWith(token)
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: payload.id },
                relations: ['roles'],
            })
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.authorization).not.toHaveBeenCalled()
        })
    })

    describe('refreshToken', () => {
        let token: string
        let userAgent: string
        let userPayload: UserPayload
        let user: User
        let authTokens: IAuthTokens

        beforeEach(() => {
            token = 'jwt token'
            userAgent = 'supertest agent'
            userPayload = userPayloadMock as UserPayload
            user = userMock as User
            authTokens = authTokensMock
        })

        it('should update token', async () => {
            jest.spyOn(
                tokenService,
                'extractUserPayload',
            ).mockResolvedValueOnce(userPayload)
            jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user)
            jest.spyOn(tokenService, 'authorization').mockResolvedValueOnce(
                authTokens,
            )

            const result = await service.refreshToken(token, userAgent)

            expect(tokenService.extractUserPayload).toHaveBeenCalledWith(token)
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: userPayload.id },
                relations: ['roles'],
            })
            expect(tokenService.authorization).toHaveBeenCalledWith(
                user,
                userAgent,
            )
            expect(result).toEqual(authTokens)
        })

        it('should throw unAuth if user not found', async () => {
            jest.spyOn(
                tokenService,
                'extractUserPayload',
            ).mockResolvedValueOnce(userPayload)
            jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null)
            jest.spyOn(tokenService, 'authorization').mockResolvedValueOnce(
                authTokens,
            )

            await expect(
                service.refreshToken(token, userAgent),
            ).rejects.toThrow(UnauthorizedException)

            expect(tokenService.extractUserPayload).toHaveBeenCalledWith(token)
            expect(userRepository.findOne).toHaveBeenCalledWith({
                where: { id: userPayload.id },
                relations: ['roles'],
            })
            expect(tokenService.authorization).not.toHaveBeenCalled()
        })
    })

    describe('resetPass', () => {
        let emailDto: EmailDto
        let user: User
        let token: string

        beforeEach(() => {
            emailDto = { email: 'test22011997@gmail.com' }
            user = userMock as User
            token = 'jwt token'
        })

        it('should send reset-pass mail', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(user)
            jest.spyOn(tokenService, 'signId').mockResolvedValueOnce(token)
            jest.spyOn(mailService, 'resetPassMail').mockResolvedValueOnce()

            await service.resetPass(emailDto)

            expect(userRepository.findOneBy).toHaveBeenCalledWith({
                email: emailDto.email,
            })
            expect(tokenService.signId).toHaveBeenCalledWith(user.id)
            expect(mailService.resetPassMail).toHaveBeenCalledWith(
                token,
                emailDto.email,
            )
        })
    })
})
