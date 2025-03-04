import { forwardRef, Module } from '@nestjs/common'
import { TokenService } from './token.service'
import { TokenController } from './token.controller'
import { AuthModule } from '@src/auth/auth.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Token } from '@src/token/entities'

@Module({
    imports:[forwardRef(()=>AuthModule),TypeOrmModule.forFeature([Token])],
    controllers: [TokenController],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule {}
