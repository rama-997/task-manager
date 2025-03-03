import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from '@src/auth/strategies'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { MailModule } from '@src/mail/mail.module'
import { TokenModule } from '@src/token/token.module'

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({}),
        TypeOrmModule.forFeature([User]),
        MailModule,
        TokenModule
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [JwtModule],
})
export class AuthModule {}
