import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from '@src/auth/strategies'

@Module({
    imports: [PassportModule, JwtModule.registerAsync({})],
    controllers: [AuthController],
    providers: [AuthService,JwtStrategy],
})
export class AuthModule {}
