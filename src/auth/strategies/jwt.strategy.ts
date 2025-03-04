import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { dotenvConfig } from '@libs/configs'
import { UserPayload } from '@src/token/types'

require('dotenv').config(dotenvConfig)
const config = new ConfigService()

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey:config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        })
    }

    async validate(payload: UserPayload): Promise<UserPayload> {
        return payload
    }
}