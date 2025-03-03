import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { TokenService } from '@src/token/token.service'
import { MailService } from '@src/mail/mail.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { Repository } from 'typeorm'
import * as bcryptjs from 'bcryptjs'
import { signUpDtoMock, userMock } from '@src/auth/mocks'
import { SignUpDto } from '@src/auth/dto'
import { ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import { mailerMock } from '@src/mail/module-options/mocks'

describe('AuthService', () => {
    let service: AuthService
    let tokenService: TokenService
    let mailService: MailService
    let userRepository: Repository<User>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                TokenService,
                MailService,
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
                JwtService,
                ConfigService,
                {provide:MailerService,useFactory:mailerMock}
            ],
        }).compile()
        jest.clearAllMocks()

        service = module.get<AuthService>(AuthService)
        tokenService = module.get<TokenService>(TokenService)
        mailService = module.get<MailService>(MailService)
        userRepository = module.get<Repository<User>>(getRepositoryToken(User))
    })

    describe('signUp', () => {
        let hashedPass: string
        let user: Partial<User>
        let signUpDto: Partial<SignUpDto>
        let emailToken:string

        beforeEach(() => {
            hashedPass = 'hashedPassword'
            user = userMock
            signUpDto = signUpDtoMock
            emailToken='emailToken'
        })

        it('should be signed up', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null)
            jest.spyOn(bcryptjs, 'hash').mockReturnValueOnce(hashedPass as any)
            jest.spyOn(userRepository, 'save').mockResolvedValueOnce({
                ...user,
                ...signUpDto,
                password: hashedPass,
            } as User)
            jest.spyOn(tokenService,'emailToken').mockResolvedValueOnce(emailToken)
            jest.spyOn(mailService,'signUpMail').mockResolvedValueOnce()

            const result=await service.signUp(signUpDto as SignUpDto)

            expect(result).toEqual({message:expect.any(String)})
            expect(userRepository.findOneBy).toHaveBeenCalledTimes(2)
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(1,{email:signUpDto.email})
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(2,{login:signUpDto.login})
            expect(bcryptjs.hash).toHaveBeenCalledWith(signUpDto.password,3)
            expect(userRepository.save).toHaveBeenCalledWith({...signUpDto, password: hashedPass})
            expect(tokenService.emailToken).toHaveBeenCalledWith(user.id)
            expect(mailService.signUpMail).toHaveBeenCalledWith(emailToken,signUpDto.email)
        })

        it('exist e-mail', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as User)
            jest.spyOn(bcryptjs, 'hash')
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService,'emailToken')
            jest.spyOn(mailService,'signUpMail')

            await expect(service.signUp(signUpDto as SignUpDto)).rejects.toThrow(ConflictException)

            expect(userRepository.findOneBy).toHaveBeenCalledTimes(1)
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(1,{email:signUpDto.email})
            expect(bcryptjs.hash).not.toHaveBeenCalled()
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.emailToken).not.toHaveBeenCalled()
            expect(mailService.signUpMail).not.toHaveBeenCalled()
        })

        it('exist login', async () => {
            jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null).mockResolvedValueOnce(user as User)
            jest.spyOn(bcryptjs, 'hash')
            jest.spyOn(userRepository, 'save')
            jest.spyOn(tokenService,'emailToken')
            jest.spyOn(mailService,'signUpMail')

            await expect(service.signUp(signUpDto as SignUpDto)).rejects.toThrow(ConflictException)

            expect(userRepository.findOneBy).toHaveBeenCalledTimes(2)
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(1,{email:signUpDto.email})
            expect(userRepository.findOneBy).toHaveBeenNthCalledWith(2,{login:signUpDto.login})
            expect(bcryptjs.hash).not.toHaveBeenCalled()
            expect(userRepository.save).not.toHaveBeenCalled()
            expect(tokenService.emailToken).not.toHaveBeenCalled()
            expect(mailService.signUpMail).not.toHaveBeenCalled()
        })
    })
})
