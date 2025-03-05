import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthTokens, UserPayload } from '@src/token/types'
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
        @InjectRepository(Token) private readonly tokenRepository:Repository<Token>
    ){}

    toUserPayload(user:User):UserPayload{
        const roles=user.roles.map(role=>role.value)
        return {
            id:user.id,
            roles
        }
    }

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

    async updateAuthToken(refreshToken:string,agent:string,user:User){
        const token=await this.tokenRepository.findOneBy({refreshToken,userAgent:agent})
        if(token){
            token.refreshToken=refreshToken
            await this.tokenRepository.save(token)
        }else{
            await this.tokenRepository.save({refreshToken,userAgent:agent,users:[user]})
        }
    }

    async authorization(user:User,refreshToken:string,agent:string):Promise<AuthTokens>{
        const payload=this.toUserPayload(user)
        const tokens=await this.authTokens(payload)
        await this.updateAuthToken(refreshToken,agent,user)
        return tokens
    }
}
