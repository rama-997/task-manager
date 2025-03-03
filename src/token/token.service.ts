import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthTokens, UserPayload } from '@src/token/types'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ){}

    async authTokens(userPayload: UserPayload): Promise<AuthTokens> {
        const accessToken = await this.jwtService.signAsync(userPayload, {
            expiresIn: '1h',
            secret:this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')
        })
        const refreshToken = await this.jwtService.signAsync(userPayload, {
            expiresIn: '7d',
            secret:this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')
        })

        return { accessToken, refreshToken }
    }

    async emailToken(id:string): Promise<string> {
        return this.jwtService.signAsync({id}, {
            secret: this.configService.getOrThrow<string>('JWT_EMAIL_SECRET'),
            expiresIn:'1h'
        })
    }
}
