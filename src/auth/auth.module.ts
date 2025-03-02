import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from '@src/auth/strategies'
import { jwtOption } from '@src/auth/module-options'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync(jwtOption),
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [JwtModule],
})
export class AuthModule {}
