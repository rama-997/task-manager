import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '@src/user/entities'
import { AuthTokens } from '@src/token/types'

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    async authTokens(user:User):Promise<AuthTokens>{
        const accessToken = await this.jwtService.signAsync({
            id:user.id,
            roles:user.roles
        },{expiresIn: '1h'})
        const refreshToken = await this.jwtService.signAsync({
            id:user.id,
            roles:user.roles
        },{expiresIn: '7d'})

        return {accessToken, refreshToken}
    }
}
