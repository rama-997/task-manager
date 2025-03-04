import { forwardRef, Module } from '@nestjs/common'
import { TokenService } from './token.service'
import { TokenController } from './token.controller'
import { AuthModule } from '@src/auth/auth.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
    imports:[forwardRef(()=>AuthModule)],
    controllers: [TokenController],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule {}
