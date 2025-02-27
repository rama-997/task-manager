import { JwtModuleAsyncOptions } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

export const jwtOption:JwtModuleAsyncOptions={
    imports:[ConfigModule],
    inject:[ConfigService],
    useFactory:(configService:ConfigService) => ({
        secret:configService.getOrThrow<string>('JWT_SECRET'),
    })
}