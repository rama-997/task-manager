import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { EmailDto, PasswordDto, SignInDto, SignUpDto } from '@src/auth/dto'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { Repository } from 'typeorm'
import { compare, hash } from 'bcryptjs'
import { MailService } from '@src/mail/mail.service'
import { TokenService } from '@src/token/token.service'
import { IAuthTokens } from '@src/token/types'
import { RoleService } from '@src/role/role.service'
import { ERoles } from '@src/role/types'
import { IAuthMess } from '@src/auth/types'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly mailService: MailService,
        private readonly tokenService: TokenService,
        private readonly roleService: RoleService,
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<IAuthMess> {
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
        let role = await this.roleService.findOne(ERoles.USER)
        if (!role) {
            role = await this.roleService.create({ value: ERoles.USER })
        }
        const user = await this.userRepository.save({
            ...signUpDto,
            password: hashedPass,
            roles: [role],
        })
        const emailToken = await this.tokenService.emailToken(user.id)
        await this.mailService.signUpMail(emailToken, signUpDto.email)
        return { message: 'Было отправлено письмо на вашу электронную почту' }
    }

    async signIn(signInDto: SignInDto, agent: string): Promise<IAuthTokens> {
        const user = await this.userRepository.findOne({
            where: [
                { login: signInDto.loginOrEmail },
                { email: signInDto.loginOrEmail },
            ],
            relations: ['roles'],
        })
        if (!user) {
            throw new NotFoundException(
                'Такой логин или e-mail не зарегистрирован',
            )
        }
        if (!user?.isConfirm) {
            throw new ForbiddenException('Подтвердите свою почту.')
        }
        const isCorrectPass = await compare(signInDto.password, user.password)
        if (!isCorrectPass) {
            throw new ConflictException('Неверный пароль')
        }
        return this.tokenService.authorization(user, agent)
    }

    async emailConfirm(token: string, agent: string): Promise<IAuthTokens> {
        if (!token) {
            throw new UnauthorizedException()
        }
        const payload = await this.tokenService.verifyEmailToken(token)
        if (!payload) {
            throw new UnauthorizedException()
        }
        const user = await this.userRepository.findOne({
            where: { id: payload.id },
            relations: ['roles'],
        })
        if (!user) {
            throw new UnauthorizedException()
        }
        user.isConfirm = true
        await this.userRepository.save(user)
        return this.tokenService.authorization(user, agent)
    }

    async logout(token: string) {
        await this.tokenService.deleteRefreshToken(token)
    }

    async refreshToken(token: string, agent: string): Promise<IAuthTokens> {
        const payload = await this.tokenService.extractUserPayload(token)
        const user = await this.userRepository.findOne({
            where: { id: payload.id },
            relations: ['roles'],
        })
        if (!user) {
            throw new UnauthorizedException()
        }
        return this.tokenService.authorization(user, agent)
    }

    async resetPass({ email }: EmailDto): Promise<void> {
        const user = await this.userRepository.findOneBy({
            email,
        })
        if (!user) {
            throw new NotFoundException('email dose not found')
        }
        const token = await this.tokenService.signId(user.id)
        await this.mailService.resetPassMail(token, email)
    }

    async confirmPassword(
        passwordDto: PasswordDto,
        token: string,
    ): Promise<void> {
        const payload = await this.tokenService.verifyId(token)
        if (!payload) {
            throw new ForbiddenException()
        }
        const user = await this.userRepository.findOneBy({ id: payload.id })
        if (!user) {
            throw new ForbiddenException()
        }
        const hashPass = await hash(passwordDto.password, 3)
        user.password = hashPass
        await this.userRepository.save({ ...user, password: hashPass })
    }
}
