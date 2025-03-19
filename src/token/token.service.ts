import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { IAuthTokens, UserPayload } from '@src/token/types'
import { ConfigService } from '@nestjs/config'
import { User } from '@src/auth/entities'
import { Token } from '@src/token/entities'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(Token)
        private readonly tokenRepository: Repository<Token>,
    ) {}

    toUserPayload(user: User): UserPayload {
        const roles = user.roles.map(role => role.value)
        return {
            id: user.id,
            roles,
        }
    }

    async authTokens(userPayload: UserPayload): Promise<IAuthTokens> {
        const accessToken = await this.jwtService.signAsync(userPayload, {
            expiresIn: '1h',
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        })
        const refreshToken = await this.jwtService.signAsync(userPayload, {
            expiresIn: '7d',
            secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        })

        return { accessToken, refreshToken }
    }

    async emailToken(id: string): Promise<string> {
        return this.jwtService.signAsync(
            { id },
            {
                secret: this.configService.getOrThrow<string>(
                    'JWT_EMAIL_SECRET',
                ),
                expiresIn: '1h',
            },
        )
    }

    async updateAuthToken(refreshToken: string, agent: string, user: User) {
        const token = await this.tokenRepository.findOneBy({
            refreshToken,
            userAgent: agent,
        })
        if (token) {
            token.refreshToken = refreshToken
            await this.tokenRepository.save(token)
        } else {
            await this.tokenRepository.save({
                refreshToken,
                userAgent: agent,
                users: [user],
            })
        }
    }

    async authorization(user: User, agent: string): Promise<IAuthTokens> {
        const payload = this.toUserPayload(user)
        const tokens = await this.authTokens(payload)
        await this.updateAuthToken(tokens.refreshToken, agent, user)
        return tokens
    }

    async verifyAccessToken(token: string): Promise<UserPayload | null> {
        try {
            return this.jwtService.verifyAsync<UserPayload>(token, {
                secret: this.configService.getOrThrow<string>(
                    'JWT_ACCESS_SECRET',
                ),
            })
        } catch (e) {
            return null
        }
    }

    async verifyRefreshToken(token: string): Promise<UserPayload | null> {
        try {
            return this.jwtService.verifyAsync<UserPayload>(token, {
                secret: this.configService.getOrThrow<string>(
                    'JWT_REFRESH_SECRET',
                ),
            })
        } catch (e) {
            return null
        }
    }

    async verifyEmailToken(token: string): Promise<{ id: string } | null> {
        try {
            return this.jwtService.verifyAsync<{ id: string }>(token, {
                secret: this.configService.getOrThrow<string>(
                    'JWT_EMAIL_SECRET',
                ),
            })
        } catch (e) {
            return null
        }
    }

    async deleteRefreshToken(refreshToken: string): Promise<void> {
        await this.tokenRepository.delete({ refreshToken })
    }

    async refreshToken(refreshToken: string): Promise<UserPayload> {
        if (!refreshToken) {
            throw new UnauthorizedException()
        }
        const token = await this.tokenRepository.findOneBy({ refreshToken })
        if (!token) {
            throw new UnauthorizedException()
        }
        const payload = await this.verifyRefreshToken(refreshToken)
        if (!payload) {
            throw new UnauthorizedException()
        }
        return payload
    }

    async verifyPasswordReset(email: string): Promise<string> {
        return this.jwtService.signAsync(
            { email },
            {
                secret: this.configService.getOrThrow<string>(
                    'RESET_PASS_SECRET',
                ),
            },
        )
    }
}
