import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthTokens, UserPayload } from '@src/token/types'

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    async authTokens(userPayload: UserPayload): Promise<AuthTokens> {
        const accessToken = await this.jwtService.signAsync(userPayload, {
            expiresIn: '1h',
        })
        const refreshToken = await this.jwtService.signAsync(userPayload, {
            expiresIn: '7d',
        })

        return { accessToken, refreshToken }
    }
}
