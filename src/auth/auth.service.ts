import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { SignInDto, SignUpDto } from '@src/auth/dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { Repository } from 'typeorm'
import { compare, hash } from 'bcryptjs'
import { MailService } from '@src/mail/mail.service'
import { TokenService } from '@src/token/token.service'
import { AuthTokens } from '@src/token/types'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly mailService: MailService,
        private readonly tokenService: TokenService,
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
        const email = await this.userRepository.findOneBy({
            email: signUpDto.email,
        })
        if (email) {
            throw new ConflictException('Такой e-mail уже зарегистрирован')
        }
        const login = await this.userRepository.findOneBy({
            login: signUpDto.login,
        })
        if (login) {
            throw new ConflictException('Такой логин уже занят')
        }
        const hashedPass = await hash(signUpDto.password, 3)
        const user = await this.userRepository.save({
            ...signUpDto,
            password: hashedPass,
        })
        const emailToken = await this.tokenService.emailToken(user.id)
        await this.mailService.signUpMail(emailToken, signUpDto.email)
        return { message: 'Было отправлено письмо на вашу электронную почту' }
    }

    async signIn(signInDto: SignInDto,agent:string): Promise<AuthTokens> {
        const user = await this.userRepository.findOneBy([
            { login: signInDto.loginOrEmail },
            { email: signInDto.loginOrEmail },
        ])
        if(!user) {
            throw new NotFoundException('Неправильный логин или e-mail')
        }
        const isCorrectPass=await compare(signInDto.password,user.password)
        if(!isCorrectPass) {
            throw new ConflictException('Неверный пароль')
        }
        return this.tokenService.authorization(user,agent)
    }
}
